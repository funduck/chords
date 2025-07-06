package app

import (
	"chords.com/api/internal/logger"
	"chords.com/api/internal/service"
)

type App struct {
	logger         logger.Logger
	artistService  *service.ArtistService
	libraryService *service.LibraryService
	roomService    *service.RoomService
	songService    *service.SongService
}

func NewApp() *App {
	return &App{
		logger:         logger.NewLogger("app"),
		artistService:  service.NewArtistService(),
		libraryService: service.NewLibraryService(),
		roomService:    service.NewRoomService(),
		songService:    service.NewSongService(),
	}
}
