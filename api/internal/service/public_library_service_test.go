package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestPublicLibraryService(t *testing.T) {
	config.InitForTest()
	orm.InitForTest()

	svc := NewPublicLibraryService()

	tx := orm.GetDBInstance()
	var err error

	song := entity.Song{
		Title:  "Test Song",
		Artist: "Test Artist",
		Format: "chordpro",
		Sheet:  "{title: Test Song, artist: Test Artist, body: {chords: [C, G, Am, F]}}",
	}
	err = tx.Create(&song).Error
	assert.NoError(t, err, "failed to create test song")

	library := entity.PublicLibrary{
		Name:  "Test Library",
		Songs: []*entity.Song{&song},
	}
	err = tx.Create(&library).Error
	assert.NoError(t, err, "failed to create test public library")

	t.Run("Search finds some", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &entity.SearchSongRequest{
			Query:  "Test",
			Limit:  10,
			Offset: 0,
		})
		assert.NoError(t, err, "expected no error when searching public library")
		assert.NotNil(t, res, "expected search results to be returned")

		assert.Len(t, res.Songs, 1)
		assert.Equal(t, "Test Song", res.Songs[0].Title, "expected song title to match")
	})

	t.Run("Search is empty", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &entity.SearchSongRequest{
			Query:  "Test",
			Limit:  10,
			Offset: 10, // Offset beyond the number of songs
		})
		assert.NoError(t, err, "expected no error when searching public library")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Empty(t, res.Songs, "expected no songs to be returned for offset beyond the number of songs")
	})
}
