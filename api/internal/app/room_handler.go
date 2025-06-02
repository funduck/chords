package app

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"

	"chords.com/api/internal/auth"
	_ "chords.com/api/internal/entity"
)

// CreateRoom godoc
// @Summary      Create a new room
// @Description  Create a new room with a unique code and add the user to it.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Success      201 {object} entity.Room "Room created successfully"
// @Failure      401 {object} string "Unauthorized"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms [post]
func (a *App) CreateRoom(w http.ResponseWriter, r *http.Request) {
	if accessToken, err := auth.GetAccessToken(r.Context()); err != nil {
		a.respondError(w, http.StatusUnauthorized, err)
		return
	} else {
		room, err := a.roomService.CreateRoom(r.Context(), accessToken)
		if err != nil {
			a.respondError(w, http.StatusInternalServerError, err)
			return
		}
		a.respondJSON(w, http.StatusCreated, room)
	}
}

type JoinRoomRequest struct {
	RoomCode string `json:"room_code"`
}

// JoinRoom godoc
// @Summary      Join a room
// @Description  Join a room using the room code.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        request body JoinRoomRequest true "Join Room Request"
// @Security     BearerAuth
// @Success      200 {object} entity.Room "Room joined successfully"
// @Failure      400 {object} string "Bad Request"
// @Failure      401 {object} string "Unauthorized"
// @Failure      404 {object} string "Room Not Found"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms/join [post]
func (a *App) JoinRoom(w http.ResponseWriter, r *http.Request) {
	dto := JoinRoomRequest{}
	if err := parseBody(w, r, &dto); err != nil {
		return
	}

	if accessToken, err := auth.GetAccessToken(r.Context()); err != nil {
		a.respondError(w, http.StatusUnauthorized, err)
		return
	} else {
		room, err := a.roomService.JoinRoom(r.Context(), dto.RoomCode, accessToken)
		if err != nil {
			a.respondError(w, http.StatusInternalServerError, err)
			return
		}
		a.respondJSON(w, http.StatusOK, room)
	}
}

// LeaveRoom godoc
// @Summary      Leave a room
// @Description  Leave a room using the room ID.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        id path string true "Room ID"
// @Security     BearerAuth
// @Success      204 "Room left successfully"
// @Failure      400 {object} string "Bad Request"
// @Failure      401 {object} string "Unauthorized"
// @Failure      404 {object} string "Room Not Found"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms/{id}/leave [post]
func (a *App) LeaveRoom(w http.ResponseWriter, r *http.Request) {
	roomID := chi.URLParam(r, "id")
	if roomID == "" {
		a.respondError(w, http.StatusBadRequest, fmt.Errorf("room ID is required"))
		return
	}

	if accessToken, err := auth.GetAccessToken(r.Context()); err != nil {
		a.respondError(w, http.StatusUnauthorized, err)
		return
	} else {
		if err := a.roomService.LeaveRoom(r.Context(), roomID, accessToken); err != nil {
			a.respondError(w, http.StatusInternalServerError, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
