package service

import (
	"context"
	"fmt"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/thoas/go-funk"
	"gorm.io/gorm/clause"
)

type SongService struct {
}

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

func (s *SongService) CreateIfNotExists(ctx context.Context, song *entity.Song) error {
	tx := orm.GetDB(ctx)

	var existingSong entity.Song
	q := tx.Model(&entity.Song{}).
		Where("songs.title = ?", song.Title).
		Where("songs.owner_id = ?", song.OwnerID)

	if len(song.Artists) > 0 {
		// If song has artists, check if all of them match
		ids := funk.Map(song.Artists, func(a *entity.Artist) uint {
			return a.ID
		}).([]uint)
		q = q.Where("? = (SELECT count(*) FROM song_artists sa WHERE sa.song_id = songs.id AND sa.artist_id IN (?))", len(ids), ids)
	}
	if len(song.Composers) > 0 {
		// If song has composers, check if all of them match
		ids := funk.Map(song.Composers, func(c *entity.Artist) uint {
			return c.ID
		}).([]uint)
		q = q.Where("? = (SELECT count(*) FROM song_composers sc WHERE sc.song_id = songs.id AND sc.artist_id IN (?))", len(ids), ids)
	}

	err := q.First(&existingSong).Error
	if err == nil {
		// Song with same title and owner already exists, return it
		*song = existingSong
		return nil
	}
	if !orm.IsRecordNotFoundError(err) {
		return err // Some other error occurred
	}

	return tx.Create(song).Error
}

func (s *SongService) UpdateSong(ctx context.Context, id uint, req *dto.UpdateSongRequest) (*entity.Song, error) {
	tx := orm.GetDB(ctx)

	accessToken, err := auth.GetAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	// Check if song exists
	var song entity.Song
	err = tx.First(&song, id).Error
	if err != nil {
		return nil, err // Song not found or other error
	}

	if song.OwnerID != accessToken.UserID {
		return nil, fmt.Errorf("you do not have permission to update this song")
	}

	if req.Sheet != "" {
		song.Sheet = req.Sheet
	}
	if req.Lyrics != "" {
		song.Lyrics = req.Lyrics
	}

	err = tx.Save(&song).Error
	if err != nil {
		return nil, err // Error saving updated song
	}

	return &song, nil
}
