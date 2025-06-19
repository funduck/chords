package service

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/entity"
	eventbus "chords.com/api/internal/event_bus"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

type RoomService struct {
	log           logger.Logger
	roomChans     map[uint]chan *eventbus.Event // Maps room ID to event channels
	roomUserIDs   map[uint]map[uint]bool        // Maps room ID to user IDs
	userListeners map[uint]map[uint]string      // Maps room ID to user ID and listener ID
}

var instance *RoomService

func NewRoomService() *RoomService {
	if instance != nil {
		return instance
	}
	instance = &RoomService{
		log:           logger.NewForModule("RoomService"),
		roomChans:     make(map[uint]chan *eventbus.Event),
		roomUserIDs:   make(map[uint]map[uint]bool),
		userListeners: make(map[uint]map[uint]string),
	}
	return instance
}

// generateRoomCode generates a random 6-character alphanumeric string.
func generateRoomCode() (string, error) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 6
	code := make([]byte, length)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		code[i] = charset[num.Int64()]
	}
	return string(code), nil
}

// Broadcasts events to all users in the room.
func (s *RoomService) broadcastRoomEvents(roomID uint) {
	roomChan := s.roomChans[roomID]
	if roomChan != nil {
		return
	}
	roomChan = make(chan *eventbus.Event, 8) // Buffered channel to prevent blocking
	s.roomChans[roomID] = roomChan
	for event := range roomChan {
		userIDsSet, exists := s.roomUserIDs[roomID]
		if !exists {
			s.log.Warnw("No users found for room",
				"roomID", roomID,
			)
			continue
		}
		userIDs := make([]uint, 0, len(userIDsSet))
		for userID := range userIDsSet {
			userIDs = append(userIDs, userID)
		}
		s.log.Debugw("Broadcasting event to room",
			"roomID", roomID,
			"event", event,
			"users", userIDs,
		)
		eventbus.GetEventBus().SendToClients(userIDs, event)
	}
}

func (s *RoomService) closeRoomChan(roomID uint) {
	if ch, exists := s.roomChans[roomID]; exists {
		close(ch)
		delete(s.roomChans, roomID)
		s.log.Debugw("Closed room channel",
			"roomID", roomID,
		)
	}
	if listeners, exists := s.userListeners[roomID]; exists {
		for userID, listener := range listeners {
			eventbus.GetEventBus().RemoveClientListener(userID, listener)
			s.log.Debugw("Removed user listener",
				"roomID", roomID,
				"userID", userID,
				"listenerID", listener,
			)
		}
		delete(s.userListeners, roomID)
		s.log.Debugw("Removed all user listeners",
			"roomID", roomID,
		)
	}
}

// Add listener to user events and broadcasts to the room's event channel.
func (s *RoomService) addUserListener(roomID uint, userID uint) {
	if _, ok := s.roomUserIDs[roomID]; !ok {
		s.roomUserIDs[roomID] = make(map[uint]bool)
	}
	s.roomUserIDs[roomID][userID] = true

	// Ensure BUS will route events for this user to the room channel
	listener := fmt.Sprintf("room_%d_user_%d", roomID, userID)
	eventbus.GetEventBus().AddClientListener(userID, listener, func(event *eventbus.Event) {
		ch := s.roomChans[roomID]
		s.log.Debugw("User event received, pushing to room channel",
			"roomID", roomID,
			"event", event,
			"channel", ch != nil,
		)
		if ch != nil {
			ch <- event
		}
	})
	if _, ok := s.userListeners[roomID]; !ok {
		s.userListeners[roomID] = make(map[uint]string)
	}
	s.userListeners[roomID][userID] = listener

	s.log.Debugw("Added user listener",
		"roomID", roomID,
		"userID", userID,
		"listenerID", listener,
	)
}

func (s *RoomService) removeUserListener(roomID uint, userID uint) {
	if s.userListeners[roomID] != nil {
		// Remove routing from BUS to room from this user
		if listener, exists := s.userListeners[roomID][userID]; exists {
			eventbus.GetEventBus().RemoveClientListener(userID, listener)
			delete(s.userListeners[roomID], userID)
			s.log.Debugw("Removed user listener",
				"roomID", roomID,
				"userID", userID,
				"listenerID", listener,
			)
		}
		if len(s.userListeners[roomID]) == 0 {
			delete(s.userListeners, roomID)
		}
	}

	if _, ok := s.roomUserIDs[roomID]; ok {
		if _, ok := s.roomUserIDs[roomID][userID]; ok {
			delete(s.roomUserIDs[roomID], userID)
			s.log.Debugw("Removed user from room user list",
				"roomID", roomID,
				"userID", userID,
			)
		}
		if len(s.roomUserIDs[roomID]) == 0 {
			delete(s.roomUserIDs, roomID)
		}
	}
}

// CreateRoom creates a new room with a unique code and adds the user to it.
func (s *RoomService) CreateRoom(ctx context.Context, accessToken *auth.AccessToken) (*entity.Room, error) {
	s.log.Debugw("User is trying to create a new room",
		"userID", accessToken.UserID,
	)
	tx := orm.GetDB(ctx)

	var err error
	room := &entity.Room{}
	room.OwnerID = accessToken.UserID
	if room.Code, err = generateRoomCode(); err != nil {
		return nil, err
	}

	if err = tx.Save(room).Error; err != nil {
		return nil, err
	}
	s.log.Infow("Created new room",
		"roomID", room.ID,
		"roomCode", room.Code,
		"ownerID", room.OwnerID,
	)

	s.JoinRoom(ctx, accessToken, room.Code)

	return room, nil
}

func (s *RoomService) JoinRoom(ctx context.Context, accessToken *auth.AccessToken, roomCode string) (*entity.Room, error) {
	s.log.Debugw("User is trying to join room",
		"userID", accessToken.UserID,
		"roomCode", roomCode,
	)
	tx := orm.GetDB(ctx)

	// Find the room by code
	room := entity.Room{}
	if err := tx.Preload("Users").Where("code = ?", roomCode).First(&room).Error; err != nil {
		return nil, err
	}

	// Check if user is already in the room
	for _, u := range room.Users {
		if u.ID == accessToken.UserID {
			// Start broadcasting events for the room
			go func() {
				s.broadcastRoomEvents(room.ID)
			}()
			// Add user to the room's event listeners
			s.addUserListener(room.ID, accessToken.UserID)

			s.log.Infow("User already in room",
				"roomID", room.ID,
				"userID", accessToken.UserID,
			)
			return &room, nil
		}
	}

	// Find user
	user := entity.User{}
	if err := tx.Preload("Rooms").First(&user, accessToken.UserID).Error; err != nil {
		return nil, err
	}

	// Leave all rooms the user is currently in
	roomIDs := make([]uint, 0, len(user.Rooms))
	for _, r := range user.Rooms {
		roomIDs = append(roomIDs, r.ID)
	}
	for _, roomID := range roomIDs {
		if err := s.LeaveRoom(ctx, accessToken, roomID); err != nil {
			s.log.Errorw("Failed to leave room while joining another",
				"roomID", roomID,
				"userID", accessToken.UserID,
			)
			return nil, fmt.Errorf("failed to leave room %d while joining room %d: %w", roomID, room.ID, err)
		}
	}

	// Add user to the room
	if err := tx.Model(&room).Association("Users").Append(&user); err != nil {
		return nil, err
	}

	// Start broadcasting events for the room
	go func() {
		s.broadcastRoomEvents(room.ID)
	}()
	// Add user to the room's event listeners
	s.addUserListener(room.ID, accessToken.UserID)

	s.log.Infow("User joined room",
		"userID", accessToken.UserID,
		"roomID", room.ID,
	)

	return &room, nil
}

func (s *RoomService) LeaveRoom(ctx context.Context, accessToken *auth.AccessToken, roomID uint) error {
	s.log.Debugw("User is trying to leave room",
		"userID", accessToken.UserID,
		"roomID", roomID,
	)
	tx := orm.GetDB(ctx)

	// Find the room by code
	room := entity.Room{}
	if err := tx.First(&room, roomID).Error; err != nil {
		return tx.Error
	}

	// Find user
	user := entity.User{}
	if err := tx.First(&user, accessToken.UserID).Error; err != nil {
		return tx.Error
	}

	if err := tx.Model(&room).Association("Users").Delete(&user); err != nil {
		return err
	}

	s.removeUserListener(room.ID, accessToken.UserID)

	if accessToken.UserID == room.OwnerID {
		s.log.Infow("Deleting room because owner left",
			"roomID", room.ID,
			"userID", accessToken.UserID,
		)
		// If the user is the owner, we can delete the room
		if err := tx.Delete(&room).Error; err != nil {
			return err
		}

		s.closeRoomChan(room.ID)
	}

	s.log.Infow("User left room",
		"roomID", room.ID,
		"userID", accessToken.UserID,
	)

	return nil
}

func (s *RoomService) UpdateRoom(ctx context.Context, accessToken *auth.AccessToken, roomID uint, request *entity.UpdateRoomRequest) (*entity.Room, error) {
	s.log.Debugw("User is trying to update room",
		"userID", accessToken.UserID,
		"roomID", roomID,
		"request", request,
	)
	tx := orm.GetDB(ctx)

	// Find the room by ID
	room := entity.Room{}
	if err := tx.First(&room, roomID).Error; err != nil {
		return nil, tx.Error
	}

	for _, user := range room.Users {
		if user.ID == accessToken.UserID {
			// User is part of the room, proceed with update
			break
		}
		return nil, fmt.Errorf("user %d is not in room %d", accessToken.UserID, roomID)
	}

	room.Update(request)

	if err := tx.Save(&room).Error; err != nil {
		return nil, err
	}

	s.log.Infow("Updated room",
		"roomID", room.ID,
		"request", request,
	)

	return &room, nil
}
