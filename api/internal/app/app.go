package app

import (
	"chords.com/api/internal/logger"
	"chords.com/api/internal/service"
)

type App struct {
	logger      logger.Logger
	roomService *service.RoomService
}

func NewApp() *App {
	return &App{
		logger:      logger.NewLogger("app"),
		roomService: service.NewRoomService(),
	}
}
