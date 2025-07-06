package service

import (
	"context"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"gorm.io/gorm/clause"
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
	err := tx.Model(&entity.Song{}).Preload(clause.Associations).First(&song, id).Error

	// TODO check access rights when song is private

	return &song, err
}

func (s *SongService) CreateIfNotExists(ctx context.Context, song *entity.Song) (*entity.Song, error) {
	tx := orm.GetDB(ctx)

	// Check if song already exists
	var existingSong entity.Song
	err := tx.Model(&entity.Song{}).
		Where("songs.title = ?", song.Title).
		Where("songs.owner_id = ?", song.OwnerID).
		First(&existingSong).Error
	if err == nil {
		return &existingSong, nil // Song already exists
	}
	if !orm.IsRecordNotFoundError(err) {
		return nil, err // Some other error occurred
	}

	// Create new song
	err = tx.Create(song).Error
	if err != nil {
		return nil, err
	}

	return song, nil
}
