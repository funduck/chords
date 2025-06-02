package service

import (
	"context"
	"crypto/rand"
	"math/big"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type RoomService struct {
}

func NewRoomService() *RoomService {
	return &RoomService{}
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
	room := &entity.Room{}
	room.OwnerID = accessToken.UserID

	code, err := generateRoomCode()
	if err != nil {
		return nil, err
	}
	room.Code = code

	gormdb := orm.GetDB(ctx)
	tx := gormdb.Save(room)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return room, nil
}

func (s *RoomService) JoinRoom(ctx context.Context, roomCode string, accessToken *auth.AccessToken) (*entity.Room, error) {
	gormdb := orm.GetDB(ctx)

	// Find the room by code
	room := &entity.Room{}
	tx := gormdb.Where("code = ?", roomCode).First(room)
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Check if the user is already in the room
	for _, userID := range room.UserIDs {
		if userID == accessToken.UserID {
			return room, nil // User is already in the room
		}
	}

	// Add the user to the room
	room.UserIDs = append(room.UserIDs, accessToken.UserID)
	tx = gormdb.Save(room)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return room, nil
}

func (s *RoomService) LeaveRoom(ctx context.Context, roomID string, accessToken *auth.AccessToken) error {
	gormdb := orm.GetDB(ctx)

	// Find the room by code
	room := &entity.Room{}
	tx := gormdb.Where("id = ?", roomID).First(room)
	if tx.Error != nil {
		return tx.Error
	}

	// Remove the user from the room
	for i, userID := range room.UserIDs {
		if userID == accessToken.UserID {
			room.UserIDs = append(room.UserIDs[:i], room.UserIDs[i+1:]...)
			break
		}
	}

	if accessToken.UserID == room.OwnerID {
		// If the user is the owner, we can delete the room
		tx = gormdb.Delete(room)
		if tx.Error != nil {
			return tx.Error
		}
		return nil
	}

	tx = gormdb.Save(room)
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
