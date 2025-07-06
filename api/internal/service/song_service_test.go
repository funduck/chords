package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/dto"
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
		Sheet: `
        {title: Test Song}
        {artist: Test Artist}
        Verse 1:
        [C]This is a [G]test [C]song
        [Am]With some [F]lyrics`,
	}
	err = tx.Create(&song).Error
	assert.NoError(t, err, "failed to create test song")

	library := entity.Library{
		Name:  "Test Library",
		Songs: []*entity.Song{&song},
	}
	err = tx.Create(&library).Error
	assert.NoError(t, err, "failed to create test library")

	t.Run("GetSongByID returns song", func(t *testing.T) {
		res, err := svc.GetSongByID(context.Background(), song.ID)
		assert.NoError(t, err, "expected no error when getting song by ID")
		assert.NotNil(t, res, "expected song to be returned")

		assert.Equal(t, song.ID, res.ID, "expected song ID %d, got %d", song.ID, res.ID)
		assert.Equal(t, song.Title, res.Title, "expected song title %q, got %q", song.Title, res.Title)
		assert.Equal(t, song.Artists[0].Name, res.Artists[0].Name, "expected song artist %q, got %q", song.Artists[0].Name, res.Artists[0].Name)
		assert.Equal(t, song.Format, res.Format, "expected song format %q, got %q", song.Format, res.Format)
	})

	t.Run("Search finds some", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query:       "Test",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")

		assert.Equal(t, int64(1), res.Total, "expected total %d, got %d", 1, res.Total)
		assert.Len(t, res.Songs, 1)
		assert.Equal(t, "Test Song", res.Songs[0].Title, "expected song title %q, got %q", "Test Song", res.Songs[0].Title)
	})

	t.Run("Search by lyrics finds some", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query:       "with some lyrics",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")

		assert.Equal(t, int64(1), res.Total, "expected total %d, got %d", 1, res.Total)
		assert.Len(t, res.Songs, 1)
		assert.Equal(t, "Test Song", res.Songs[0].Title, "expected song title %q, got %q", "Test Song", res.Songs[0].Title)
	})

	t.Run("Search by artist finds some", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			ArtistID:    artist.ID,
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		assert.NoError(t, err, "expected no error when searching by artist")
		assert.NotNil(t, res, "expected search results to be returned")

		assert.Equal(t, int64(1), res.Total, "expected total %d, got %d", 1, res.Total)
		assert.Len(t, res.Songs, 1)
		assert.Equal(t, "Test Song", res.Songs[0].Title, "expected song title %q, got %q", "Test Song", res.Songs[0].Title)
	})

	t.Run("Search by non-existing artist is empty", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			ArtistID:    999, // Non-existing artist ID
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		assert.NoError(t, err, "expected no error when searching by non-existing artist")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Equal(t, int64(0), res.Total, "expected total %d, got %d", 0, res.Total)
		assert.Empty(t, res.Songs, "expected no songs to be returned for non-existing artist")
	})

	t.Run("Search is empty", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query: "Test",
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Empty(t, res.Songs, "expected no songs to be returned when ReturnRows is false")
	})

	t.Run("Search by lyrics is empty", func(t *testing.T) {
		res, err := svc.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query: "nonexistent lyrics",
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Empty(t, res.Songs, "expected no songs to be returned for nonexistent lyrics")
	})
}
