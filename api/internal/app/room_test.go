package app

import (
	"bytes"
	"encoding/json"
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

	t.Run("Create Room Handler", func(t *testing.T) {
		// Mock access token
		accessToken := &auth.AccessToken{UserID: "test-user-id"}
		conf := config.New()
		tokenString, err := accessToken.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
		assert.NoError(t, err)

		req, err := http.NewRequest(http.MethodPost, server.URL+"/api/rooms", bytes.NewBuffer([]byte{}))
		assert.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+tokenString)

		client := &http.Client{}
		resp, err := client.Do(req)
		assert.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		room := entity.Room{}
		err = json.NewDecoder(resp.Body).Decode(&room)
		assert.NoError(t, err)
		assert.NotEmpty(t, room.Code)
	})

}

// func TestJoinRoomHandler(t *testing.T) {
// 	roomService := service.NewRoomService()
// 	handler := NewAppHandler(roomService) // Assuming you have a function to initialize the app handler

// 	server := httptest.NewServer(handler)
// 	defer server.Close()

// 	// Create a room first
// 	accessToken := &auth.AccessToken{UserID: "test-user-id"}
// 	roomCode, err := roomService.CreateRoom(context.Background(), accessToken)
// 	assert.NoError(t, err)

// 	// Mock join room request
// 	joinRequest := struct {
// 		RoomCode string `json:"room_code"`
// 	}{
// 		RoomCode: roomCode,
// 	}
// 	joinRequestBytes, _ := json.Marshal(joinRequest)

// 	req, err := http.NewRequest(http.MethodPost, server.URL+"/rooms/join", bytes.NewBuffer(joinRequestBytes))
// 	assert.NoError(t, err)
// 	req.Header.Set("Content-Type", "application/json")

// 	client := &http.Client{}
// 	resp, err := client.Do(req)
// 	assert.NoError(t, err)
// 	defer resp.Body.Close()

// 	assert.Equal(t, http.StatusOK, resp.StatusCode)

// 	var response entity.Room
// 	err = json.NewDecoder(resp.Body).Decode(&response)
// 	assert.NoError(t, err)
// 	assert.Equal(t, roomCode, response.Code)
// 	assert.Contains(t, response.UserIDs, accessToken.UserID)
// }

// func TestLeaveRoomHandler(t *testing.T) {
// 	roomService := service.NewRoomService()
// 	handler := NewAppHandler(roomService) // Assuming you have a function to initialize the app handler

// 	server := httptest.NewServer(handler)
// 	defer server.Close()

// 	// Create a room first
// 	accessToken := &auth.AccessToken{UserID: "test-user-id"}
// 	roomCode, err := roomService.CreateRoom(context.Background(), accessToken)
// 	assert.NoError(t, err)

// 	// Mock leave room request
// 	leaveRequest := struct {
// 		RoomID string `json:"room_id"`
// 	}{
// 		RoomID: roomCode,
// 	}
// 	leaveRequestBytes, _ := json.Marshal(leaveRequest)

// 	req, err := http.NewRequest(http.MethodPost, server.URL+"/rooms/leave", bytes.NewBuffer(leaveRequestBytes))
// 	assert.NoError(t, err)
// 	req.Header.Set("Content-Type", "application/json")

// 	client := &http.Client{}
// 	resp, err := client.Do(req)
// 	assert.NoError(t, err)
// 	defer resp.Body.Close()

// 	assert.Equal(t, http.StatusOK, resp.StatusCode)
// }
