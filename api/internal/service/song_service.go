package service

import (
	"context"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type SongService struct{}

var songServiceInstance *SongService

func NewSongService() *SongService {
	if songServiceInstance != nil {
		return songServiceInstance
	}
	songServiceInstance = &SongService{}
	return songServiceInstance
}

func (s *SongService) GetSongByID(ctx context.Context, id uint) (*entity.Song, error) {
	tx := orm.GetDB(ctx)
	var song entity.Song
	err := tx.Model(&entity.Song{}).First(&song, id).Error

	// TODO check access rights when song is private

	return &song, err
}
