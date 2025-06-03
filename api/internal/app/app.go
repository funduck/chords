package app

import (
	eventbus "chords.com/api/internal/event_bus"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/service"
)

type App struct {
	logger      logger.Logger
	eventBus    *eventbus.EventBus
	roomService *service.RoomService
}

func NewApp() *App {
	return &App{
		logger:      logger.NewLogger("app"),
		eventBus:    eventbus.NewEventBus(),
		roomService: service.NewRoomService(),
	}
}
