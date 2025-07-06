package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestSongService(t *testing.T) {
	config.InitForTest()
	orm.InitForTest()

	svc := NewSongService()

	tx := orm.GetDBInstance()
	var err error

	artist := entity.Artist{
		Name: "Test Artist",
	}
	err = tx.Create(&artist).Error
	assert.NoError(t, err, "failed to create test artist")

	song := entity.Song{
		Title:   "Test Song",
		Artists: []*entity.Artist{&artist},
		Format:  "chordpro",
		Sheet:   "{title: Test Song, artist: Test Artist, body: {chords: [C, G, Am, F]}}",
	}
	err = tx.Create(&song).Error
	assert.NoError(t, err, "failed to create test song")

	t.Run("GetSongByID returns song", func(t *testing.T) {
		res, err := svc.GetSongByID(context.Background(), song.ID)
		assert.NoError(t, err, "expected no error when getting song by ID")
		assert.NotNil(t, res, "expected song to be returned")

		assert.Equal(t, song.ID, res.ID, "expected song ID to match")
		assert.Equal(t, song.Title, res.Title, "expected song title to match")
		assert.Equal(t, song.Artists[0].Name, res.Artists[0].Name, "expected song artist to match")
		assert.Equal(t, song.Format, res.Format, "expected song format to match")
	})
}
