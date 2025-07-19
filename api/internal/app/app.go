package app

import (
	"chords.com/api/internal/logger"
	"chords.com/api/internal/service"
	"chords.com/api/internal/usecase"
)

type App struct {
	logger            logger.Logger
	artistService     *service.ArtistService
	libraryService    *service.LibraryService
	roomService       *service.RoomService
	songService       *service.SongService
	createSongUseCase *usecase.CreateSongUseCase
}

func NewApp() *App {
	return &App{
		logger:            logger.NewLogger("app"),
		artistService:     service.NewArtistService(),
		libraryService:    service.NewLibraryService(),
		roomService:       service.NewRoomService(),
		songService:       service.NewSongService(),
		createSongUseCase: usecase.NewCreateSongUseCase(),
	}
}
