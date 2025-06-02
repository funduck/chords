package service

import (
	"context"
	"crypto/rand"
	"math/big"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

type RoomService struct {
	log logger.Logger
}

func NewRoomService() *RoomService {
	return &RoomService{
		log: logger.NewForModule("RoomService"),
	}
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
	s.log.Infof("Room created with code: %s by user: %s", room.Code, accessToken.UserID)

	return room, nil
}

func (s *RoomService) JoinRoom(ctx context.Context, roomCode string, accessToken *auth.AccessToken) (*entity.Room, error) {
	tx := orm.GetDB(ctx)

	// Find the room by code
	room := entity.Room{}
	if err := tx.Where("code = ?", roomCode).First(&room).Error; err != nil {
		return nil, err
	}
	s.log.Infof("User %s is trying to join room with code: %s", accessToken.UserID, roomCode)

	// Find user
	user := entity.User{}
	if err := tx.First(&user, accessToken.UserID).Error; err != nil {
		return nil, err
	}

	// Add user to the room
	if err := tx.Model(&room).Association("Users").Append(&user); err != nil {
		return nil, err
	}

	s.log.Infof("User %s joined room with code: %s", accessToken.UserID, roomCode)

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

	s.log.Infof("User %s is trying to leave room with ID: %s", accessToken.UserID, roomID)

	if err := tx.Model(&room).Association("Users").Delete(&user); err != nil {
		return err
	}

	if accessToken.UserID == room.OwnerID {
		s.log.Infof("User %s is the owner of room with ID: %s, deleting room", accessToken.UserID, roomID)
		// If the user is the owner, we can delete the room
		if err := tx.Delete(&room).Error; err != nil {
			return err
		}
		return nil
	}

	if err := tx.Save(room).Error; err != nil {
		return err
	}
	s.log.Infof("User %s left room with ID: %s", accessToken.UserID, roomID)

	return nil
}
