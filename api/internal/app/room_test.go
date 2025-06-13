package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestCreateRoomHandler(t *testing.T) {
	config.InitForTest()

	orm.InitForTest()
	defer orm.Close()

	a := NewApp()
	r := NewHttpRouter(a)

	server := httptest.NewServer(r)
	defer server.Close()

	room := entity.Room{}

	conf := config.New()

	tx := orm.GetDBInstance()
	// Mock access token
	user1 := entity.User{}
	err := tx.Create(&user1).Error
	assert.NoError(t, err)
	user2 := entity.User{}
	err = tx.Create(&user2).Error
	assert.NoError(t, err)

	accessToken1 := &auth.AccessToken{UserID: user1.ID}
	tokenString1, err := accessToken1.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
	assert.NoError(t, err)

	// Mock another access token
	accessToken2 := &auth.AccessToken{UserID: user2.ID}
	tokenString2, err := accessToken2.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
	assert.NoError(t, err)

	client := &http.Client{}

	t.Run("Create Room Handler", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, server.URL+"/api/rooms", bytes.NewBuffer([]byte{}))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString1)

		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		err = json.NewDecoder(resp.Body).Decode(&room)
		assert.NoError(t, err)
		assert.NotEmpty(t, room.Code)
	})

	t.Run("Join Room Handler", func(t *testing.T) {
		dto := entity.JoinRoomRequest{
			RoomCode: room.Code,
		}
		bytesData, err := json.Marshal(dto)
		assert.NoError(t, err)
		req, err := http.NewRequest(http.MethodPost, server.URL+"/api/rooms/join", bytes.NewBuffer(bytesData))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString1)

		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var joinedRoom entity.Room
		err = json.NewDecoder(resp.Body).Decode(&joinedRoom)
		assert.NoError(t, err)
		assert.Equal(t, room.Code, joinedRoom.Code)
	})

	t.Run("Join Room with another user", func(t *testing.T) {
		dto := entity.JoinRoomRequest{
			RoomCode: room.Code,
		}
		bytesData, err := json.Marshal(dto)
		assert.NoError(t, err)
		req, err := http.NewRequest(http.MethodPost, server.URL+"/api/rooms/join", bytes.NewBuffer(bytesData))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString2)

		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var joinedRoom entity.Room
		err = json.NewDecoder(resp.Body).Decode(&joinedRoom)
		assert.NoError(t, err)
		assert.Equal(t, room.Code, joinedRoom.Code)
	})

	t.Run("User2 leaves the room", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/api/rooms/%d/leave", server.URL, room.ID), bytes.NewBuffer([]byte{}))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString2)

		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusNoContent, resp.StatusCode)

		_room := entity.Room{}
		err = tx.Preload("Users").First(&_room, room.ID).Error
		assert.NoError(t, err)
		assert.Len(t, _room.Users, 1) // Only User1 should remain in the room
		assert.Equal(t, user1.ID, _room.Users[0].ID)
	})

	t.Run("User1 leaves the room", func(t *testing.T) {
		req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/api/rooms/%d/leave", server.URL, room.ID), bytes.NewBuffer([]byte{}))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString1)

		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusNoContent, resp.StatusCode)

		_room := entity.Room{}
		err = tx.Unscoped().Preload("Users").First(&_room, room.ID).Error
		assert.NoError(t, err)
		assert.Len(t, _room.Users, 0) // No users should remain in the room
		assert.NotNil(t, _room.DeletedAt, "Room should be deleted after owner leaves")
	})
}
