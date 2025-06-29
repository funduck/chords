package service

import (
	"context"
	"strings"

	"chords.com/api/internal/entity"
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
