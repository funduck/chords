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
	user2 := entity.User{
		IsAnonymous: true,
	}
	assert.NoError(t, tx.Create(&user2).Error, "failed to create second test user")
	token2 := auth.AccessToken{
		UserID:      user2.ID,
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

	t.Run("Join when already in room", func(t *testing.T) {
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

	t.Run("Join with another user", func(t *testing.T) {
		room, err = svc.JoinRoom(context.Background(), &token2, code)
		assert.NoError(t, err, "expected no error when joining room with another user")
		assert.NotNil(t, room, "expected room to be joined with another user")
		assert.Equal(t, code, room.Code, "expected room code to match")
		found := false
		for _, user := range room.Users {
			if user.ID == token2.UserID {
				found = true
				break
			}
		}
		assert.True(t, found, "expected second user to be in room users")
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

	t.Run("Leave other rooms when joining a new one", func(t *testing.T) {
		// user2 creates first room
		room, err = svc.CreateRoom(context.Background(), &token2)
		assert.NoError(t, err, "expected no error when creating room")
		code = room.Code

		// user joins the first room
		room, err = svc.JoinRoom(context.Background(), &token, code)
		assert.NoError(t, err, "expected no error when joining room created by another user")
		assert.NotNil(t, room, "expected room to be joined")
		assert.Equal(t, code, room.Code, "expected room code to match the one created by user2")
		found := false
		for _, user := range room.Users {
			if user.ID == token.UserID {
				found = true
				break
			}
		}
		assert.True(t, found, "expected user to be in room users after joining room created by another user")

		// user creates a second room
		room2, err := svc.CreateRoom(context.Background(), &token)
		assert.NoError(t, err, "expected no error when creating second room")
		assert.NotNil(t, room2, "expected second room to be created")
		assert.NotEqual(t, room.ID, room2.ID, "expected different room IDs")

		// Check that the user is not in the first room anymore
		err = tx.Model(&entity.Room{}).Where("id = ?", room.ID).Preload("Users").First(&room).Error
		assert.NoError(t, err, "expected no error when fetching first room")
		assert.Equal(t, room.Code, code, "expected room code to match the first room")
		for _, user := range room.Users {
			assert.NotEqual(t, user.ID, token.UserID, "expected user to not be in the first room after joining a new one")
		}
	})
}
