package usecase

import (
	"context"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/service"
)

type ICreateSongArtistService interface {
	CreateIfNotExists(ctx context.Context, artist *entity.Artist) error
}

type ICreateSongLibraryService interface {
	EnsureUserLibrary(ctx context.Context, userID uint) (*entity.Library, error)
	AddArtistToLibrary(ctx context.Context, library *entity.Library, artist *entity.Artist) error
	AddSongToLibrary(ctx context.Context, library *entity.Library, song *entity.Song) error
}

type ICreateSongSongService interface {
	CreateIfNotExists(ctx context.Context, song *entity.Song) error
}

type CreateSongUseCase struct {
	artistService  ICreateSongArtistService
	libraryService ICreateSongLibraryService
	songService    ICreateSongSongService
}

func NewCreateSongUseCase() *CreateSongUseCase {
	return &CreateSongUseCase{
		artistService:  service.NewArtistService(),
		libraryService: service.NewLibraryService(),
		songService:    service.NewSongService(),
	}
}

func (uc *CreateSongUseCase) Execute(ctx context.Context, req *dto.CreateSongRequest) (*entity.Song, error) {
	accessToken, err := auth.GetAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	library, err := uc.libraryService.EnsureUserLibrary(ctx, accessToken.UserID)
	if err != nil {
		return nil, err
	}

	var artists []*entity.Artist
	if len(req.Artists) > 0 {
		for _, artistName := range req.Artists {
			artist := &entity.Artist{Name: artistName}
			err = uc.artistService.CreateIfNotExists(ctx, artist)
			if err != nil {
				return nil, err
			}
			err = uc.libraryService.AddArtistToLibrary(ctx, library, artist)
			if err != nil {
				return nil, err
			}
			artists = append(artists, artist)
		}
	}

	var composers []*entity.Artist
	if len(req.Composers) > 0 {
		for _, composerName := range req.Composers {
			composer := &entity.Artist{Name: composerName}
			err = uc.artistService.CreateIfNotExists(ctx, composer)
			if err != nil {
				return nil, err
			}
			err = uc.libraryService.AddArtistToLibrary(ctx, library, composer)
			if err != nil {
				return nil, err
			}
			composers = append(composers, composer)
		}
	}

	song := &entity.Song{
		Artists:   artists,
		Composers: composers,
		Format:    req.Format,
		OwnerID:   accessToken.UserID,
		Sheet:     req.Sheet,
		Title:     req.Title,
	}

	err = uc.songService.CreateIfNotExists(ctx, song)
	if err != nil {
		return nil, err
	}

	err = uc.libraryService.AddSongToLibrary(ctx, library, song)
	if err != nil {
		return nil, err
	}

	return song, err
}
