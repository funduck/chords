package service

import (
	"context"
	"fmt"
	"testing"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestRoomService(t *testing.T) {
	config.InitForTest()
	orm.InitForTest()

	svc := NewRoomService()

	code := ""

	tx := orm.GetDBInstance()
	user := entity.User{
		IsAnonymous: true,
	}
	assert.NoError(t, tx.Create(&user).Error, "failed to create test user")
	token := auth.AccessToken{
		UserID:      user.ID,
		IsAnonymous: true,
	}
	room := &entity.Room{}
	var err error

	t.Run("Create", func(t *testing.T) {
		room, err = svc.CreateRoom(context.Background(), &token)
		assert.NoError(t, err, "expected no error when creating room")
		assert.NotNil(t, room, "expected room to be created")
		assert.NotEmpty(t, room.Code, "expected room code to be generated")
		assert.Equal(t, token.UserID, room.OwnerID, "expected room owner to match access token user ID")
		code = room.Code
	})

	t.Run("Join", func(t *testing.T) {
		room, err = svc.JoinRoom(context.Background(), &token, code)
		assert.NoError(t, err, "expected no error when joining room")
		assert.NotNil(t, room, "expected room to be joined")
		assert.Equal(t, code, room.Code, "expected room code to match")
		found := false
		for _, user := range room.Users {
			if user.ID == token.UserID {
				found = true
				break
			}
		}
		assert.True(t, found, "expected user to be in room users")
	})

	t.Run("Update", func(t *testing.T) {
		newState := map[string]interface{}{
			"key": "value",
		}
		room, err = svc.UpdateRoom(context.Background(), &token, room.ID, &entity.UpdateRoomRequest{
			State: (interface{}(newState)),
		})
		assert.NoError(t, err, "expected no error when updating room")
		assert.NotNil(t, room, "expected room to be updated")
		assert.NotNil(t, room.State, "expected room state to be updated")
		fmt.Printf("Updated room state: %+v\n", room.State)
	})

	t.Run("Leave", func(t *testing.T) {
		err := svc.LeaveRoom(context.Background(), &token, room.ID)
		assert.NoError(t, err, "expected no error when leaving room")
	})
}
