package usecase

import (
	"context"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"chords.com/api/internal/service"
)

type ICreateSongArtistService interface {
	CreateIfNotExists(ctx context.Context, name string) (*entity.Artist, error)
}

type ICreateSongLibraryService interface {
	EnsureUserLibrary(ctx context.Context, userID uint) (*entity.Library, error)
	AddSongToLibrary(ctx context.Context, library *entity.Library, song *entity.Song) error
}

type CreateSongUseCase struct {
	artistService  ICreateSongArtistService
	libraryService ICreateSongLibraryService
}

func NewCreateSongUseCase() *CreateSongUseCase {
	return &CreateSongUseCase{
		artistService:  service.NewArtistService(),
		libraryService: service.NewLibraryService(),
	}
}

func (uc *CreateSongUseCase) Execute(ctx context.Context, req *dto.CreateSongRequest) (*entity.Song, error) {
	tx := orm.GetDB(ctx)

	accessToken, err := auth.GetAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	var artists []*entity.Artist
	if len(req.Artists) > 0 {
		for _, artistName := range req.Artists {
			artist, err := uc.artistService.CreateIfNotExists(ctx, artistName)
			if err != nil {
				return nil, err
			}
			artists = append(artists, artist)
		}
	}

	var composers []*entity.Artist
	if len(req.Composers) > 0 {
		for _, composerName := range req.Composers {
			com, err := uc.artistService.CreateIfNotExists(ctx, composerName)
			if err != nil {
				return nil, err
			}
			composers = append(composers, com)
		}
	}

	// Create the song entity
	song := &entity.Song{
		Artists:   artists,
		Composers: composers,
		Format:    req.Format,
		OwnerID:   accessToken.UserID,
		Sheet:     req.Sheet,
		Title:     req.Title,
	}

	err = tx.Create(song).Error
	if err != nil {
		return nil, err
	}

	library, err := uc.libraryService.EnsureUserLibrary(ctx, accessToken.UserID)
	if err != nil {
		return nil, err
	}

	err = uc.libraryService.AddSongToLibrary(ctx, library, song)
	if err != nil {
		return nil, err
	}

	return song, err
}
