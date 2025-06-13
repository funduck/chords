package app

import (
	"net/http"

	"chords.com/api/internal/entity"
	_ "chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
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
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	// Start a transaction
	tx := orm.GetDB(r.Context())
	orm.SetDB(r.Context(), tx.Begin())
	defer tx.Rollback()

	room, err := a.roomService.CreateRoom(r.Context(), accessToken)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	tx.Commit()
	a.respondJSON(w, http.StatusCreated, room)
}

// JoinRoom godoc
// @Summary      Join a room
// @Description  Join a room using the room code.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        request body entity.JoinRoomRequest true "Join Room Request"
// @Security     BearerAuth
// @Success      200 {object} entity.Room "Room joined successfully"
// @Failure      400 {object} string "Bad Request"
// @Failure      401 {object} string "Unauthorized"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms/join [post]
func (a *App) JoinRoom(w http.ResponseWriter, r *http.Request) {
	dto := entity.JoinRoomRequest{}
	if err := parseBody(w, r, &dto); err != nil {
		return
	}

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}
	room, err := a.roomService.JoinRoom(r.Context(), accessToken, dto.RoomCode)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}
	a.respondJSON(w, http.StatusOK, room)
}

// LeaveRoom godoc
// @Summary      Leave a room
// @Description  Leave a room using the room ID.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        id path integer true "Room ID"
// @Security     BearerAuth
// @Success      204 "Room left successfully"
// @Failure      400 {object} string "Bad Request"
// @Failure      401 {object} string "Unauthorized"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms/{id}/leave [post]
func (a *App) LeaveRoom(w http.ResponseWriter, r *http.Request) {
	roomID, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}
	if err := a.roomService.LeaveRoom(r.Context(), accessToken, roomID); err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// UpdateRoom godoc
// @Summary      Update a room
// @Description  Update the state of a room.
// @Tags         rooms
// @Accept       json
// @Produce      json
// @Param        id path integer true "Room ID"
// @Param        request body entity.UpdateRoomRequest true "Update Room Request"
// @Security     BearerAuth
// @Success      200 {object} entity.Room "Room updated successfully"
// @Failure      400 {object} string "Bad Request"
// @Failure      401 {object} string "Unauthorized"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/rooms/{id} [patch]
func (a *App) UpdateRoom(w http.ResponseWriter, r *http.Request) {
	roomID, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	dto := entity.UpdateRoomRequest{}
	if err := parseBody(w, r, &dto); err != nil {
		return
	}

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}
	room, err := a.roomService.UpdateRoom(r.Context(), accessToken, roomID, &dto)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}
	a.respondJSON(w, http.StatusOK, room)
}
