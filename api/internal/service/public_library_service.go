package service

import (
	"context"
	"strings"

	"chords.com/api/internal/dto"
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

func (s *PublicLibraryService) SearchSongs(ctx context.Context, req *dto.SearchSongRequest) (*dto.SearchSongResponse, error) {
	tx := orm.GetDB(ctx)

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	q := tx.Model(&entity.Song{}).
		Joins("JOIN public_library_songs pls ON pls.song_id = songs.id")

	if req.Query != "" {
		query := "%" + strings.ToLower(req.Query) + "%"
		q = q.
			Where("(LOWER(title) LIKE ?) OR (LOWER(artist) LIKE ?)", query, query)
	}
	if req.QueryLyrics != "" {
		q = orm.SearchFTS(q, "songs", req.QueryLyrics)
	}

	// Count total number of matching songs
	var total int64
	if req.ReturnTotal {
		err := q.Count(&total).Error
		if err != nil {
			return nil, err
		}
	}

	var songs []*dto.SongInfo
	if req.ReturnRows {
		// Find songs with pagination
		err := q.
			Order("songs.id ASC").
			Offset(req.Offset).
			Limit(req.Limit).
			Select("songs.id", "songs.title", "songs.artist", "songs.composer", "songs.format").
			Find(&songs).Error
		if err != nil {
			return nil, err
		}
	}

	return &dto.SearchSongResponse{Songs: songs, Total: total}, nil
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
