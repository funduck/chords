package app

import (
	"chords.com/api/internal/logger"
	"chords.com/api/internal/service"
)

type App struct {
	logger               logger.Logger
	publicLibraryService *service.PublicLibraryService
	roomService          *service.RoomService
	songService          *service.SongService
}

func NewApp() *App {
	return &App{
		logger:               logger.NewLogger("app"),
		publicLibraryService: service.NewPublicLibraryService(),
		roomService:          service.NewRoomService(),
		songService:          service.NewSongService(),
	}
}
