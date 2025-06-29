package service

import (
	"context"
	"strings"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

type PublicLibraryService struct{}

var publicLibraryServiceInstance *PublicLibraryService

func NewPublicLibraryService() *PublicLibraryService {
	if publicLibraryServiceInstance != nil {
		return publicLibraryServiceInstance
	}
	publicLibraryServiceInstance = &PublicLibraryService{}
	return publicLibraryServiceInstance
}

func (s *PublicLibraryService) EnsurePublicLibrary(ctx context.Context, name string) (*entity.PublicLibrary, error) {
	tx := orm.GetDB(ctx)
	var c int64
	err := tx.Model(&entity.PublicLibrary{}).Count(&c).Error
	if err != nil {
		return nil, err
	}
	var library entity.PublicLibrary
	if c > 0 {
		err = tx.First(&library).Error
		return &library, err
	}
	library = entity.PublicLibrary{Name: name}
	err = tx.Create(&library).Error
	return &library, err
}

func (s *PublicLibraryService) SearchSongs(ctx context.Context, req *entity.SearchSongRequest) (*entity.SearchSongResponse, error) {
	tx := orm.GetDB(ctx)
	var songs []*entity.SongInfo

	query := "%" + strings.ToLower(req.Query) + "%"

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	err := tx.Model(&entity.Song{}).
		Where("(LOWER(title) LIKE ?) OR (LOWER(artist) LIKE ?)", query, query).
		Joins("JOIN public_library_songs pls ON pls.song_id = songs.id").
		Order("id ASC").
		Offset(req.Offset).
		Limit(req.Limit).
		Select("id", "title", "artist", "format").
		Find(&songs).Error
	if err != nil {
		return nil, err
	}

	return &entity.SearchSongResponse{Songs: songs}, nil
}

func (s *PublicLibraryService) UploadSong(ctx context.Context, library *entity.PublicLibrary, song *entity.Song) error {
	log := logger.GetLogger(ctx)
	tx := orm.GetDB(ctx)

	// Check if the song already exists in the public library
	var c int64
	err := tx.Model(&entity.Song{}).
		Joins("JOIN public_library_songs pls ON pls.song_id = songs.id").
		Where("title = ? AND artist = ?", song.Title, song.Artist).
		Count(&c).Error
	if c > 0 {
		log.Infof("Song already exists in public libraries: %s by %s", song.Title, song.Artist)
		return nil
	}
	if err != nil {
		return err // Some other error occurred
	}

	err = tx.Model(&library).Association("Songs").Append([]*entity.Song{song})
	return err
}
