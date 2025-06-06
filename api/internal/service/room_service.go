package service

import (
	"context"
	"crypto/rand"
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
			"eventType", event.Type,
			"eventData", event.Data,
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
	if s.roomUserIDs[roomID] == nil {
		s.roomUserIDs[roomID] = make(map[uint]bool)
	}
	// if s.roomUserIDs[roomID][userID] {
	// 	s.log.Debugw("User already exists in room user list",
	// 		"roomID", roomID,
	// 		"userID", userID,
	// 	)
	// 	return
	// }
	s.roomUserIDs[roomID][userID] = true

	listener := eventbus.GetEventBus().AddClientListener(userID, func(event *eventbus.Event) {
		ch := s.roomChans[roomID]
		s.log.Debugw("User event received, pushing to room channel",
			"roomID", roomID,
			"userID", userID,
			"eventType", event.Type,
			"eventData", event.Data,
			"channel", ch != nil,
		)
		if ch != nil {
			ch <- event
		}
	})

	if s.userListeners[roomID] == nil {
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

	if s.roomUserIDs[roomID] != nil {
		if _, exists := s.roomUserIDs[roomID][userID]; exists {
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

	// Start broadcasting events for the room
	go func() {
		s.broadcastRoomEvents(room.ID)
	}()

	s.addUserListener(room.ID, accessToken.UserID)

	return room, nil
}

func (s *RoomService) JoinRoom(ctx context.Context, roomCode string, accessToken *auth.AccessToken) (*entity.Room, error) {
	tx := orm.GetDB(ctx)

	// Find the room by code
	room := entity.Room{}
	if err := tx.Where("code = ?", roomCode).First(&room).Error; err != nil {
		return nil, err
	}
	s.log.Infow("User is trying to join room",
		"roomID", room.ID,
		"roomCode", room.Code,
		"userID", accessToken.UserID,
	)

	// Find user
	user := entity.User{}
	if err := tx.First(&user, accessToken.UserID).Error; err != nil {
		return nil, err
	}

	// Add user to the room
	if err := tx.Model(&room).Association("Users").Append(&user); err != nil {
		return nil, err
	}

	// Start broadcasting events for the room
	go func() {
		s.broadcastRoomEvents(room.ID)
	}()

	s.addUserListener(room.ID, accessToken.UserID)

	s.log.Infow("User joined room",
		"roomID", room.ID,
		"roomCode", room.Code,
		"userID", accessToken.UserID,
	)

	return &room, nil
}

func (s *RoomService) LeaveRoom(ctx context.Context, roomID string, accessToken *auth.AccessToken) error {
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

	s.log.Infow("User is trying to leave room",
		"roomID", room.ID,
		"roomCode", room.Code,
		"userID", accessToken.UserID,
	)

	if err := tx.Model(&room).Association("Users").Delete(&user); err != nil {
		return err
	}

	s.removeUserListener(room.ID, accessToken.UserID)

	if accessToken.UserID == room.OwnerID {
		s.log.Infow("User is the owner of the room, deleting room",
			"roomID", room.ID,
			"roomCode", room.Code,
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
		"roomCode", room.Code,
		"userID", accessToken.UserID,
	)

	return nil
}
