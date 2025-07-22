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

	t.Run("GetSongByID returns error for non-existent song", func(t *testing.T) {
		_, err := svc.GetSongByID(context.Background(), 9999) // Non-existent ID
		assert.Error(t, err, "expected error when getting non-existent song")
	})

	t.Run("CreateIfNotExists creates new song", func(t *testing.T) {
		newSong := &entity.Song{
			Title:   "New Test Song",
			Artists: []*entity.Artist{&artist},
			Format:  "chordpro",
			Sheet: `
			{title: New Test Song}
			{artist: Test Artist}
			Verse 1:
			[C]This is a [G]new [C]test [Am]song`,
		}

		err = svc.CreateIfNotExists(context.Background(), newSong)
		assert.NoError(t, err, "expected no error when creating new song")

		res, err := svc.GetSongByID(context.Background(), newSong.ID)
		assert.NoError(t, err, "expected no error when getting newly created song")
		assert.NotNil(t, res, "expected newly created song to be returned")
		assert.Equal(t, newSong.Title, res.Title, "expected new song title %q, got %q", newSong.Title, res.Title)
	})

	t.Run("CreateIfNotExists returns existing song", func(t *testing.T) {
		existingSong := &entity.Song{
			Title:   "Test Song", // Same title as existing song
			Artists: []*entity.Artist{&artist},
			Format:  "chordpro",
		}

		err = svc.CreateIfNotExists(context.Background(), existingSong)
		assert.NoError(t, err, "expected no error when creating existing song")

		res, err := svc.GetSongByID(context.Background(), existingSong.ID)
		assert.NoError(t, err, "expected no error when getting existing song")
		assert.NotNil(t, res, "expected existing song to be returned")
		assert.Equal(t, song.ID, res.ID, "expected existing song ID %d, got %d", song.ID, res.ID)
	})

	t.Run("CreateIfNotExists creates new song because another artist added", func(t *testing.T) {
		anotherArtist := entity.Artist{Name: "Another Artist"}
		err = tx.Create(&anotherArtist).Error
		assert.NoError(t, err, "failed to create another test artist")

		newSong := &entity.Song{
			Title:   "Test Song",
			Artists: []*entity.Artist{&artist, &anotherArtist},
			Format:  "chordpro",
			Sheet: `
			{title: Test Song}
			{artist: Test Artist, Another Artist}
			Verse 1:
			[C]This is a [G]test [C]song with [Am]another artist`,
		}

		err = svc.CreateIfNotExists(context.Background(), newSong)
		assert.NoError(t, err, "expected no error when creating song with another artist")

		resNewSong, err := svc.GetSongByID(context.Background(), newSong.ID)
		assert.NoError(t, err, "expected no error when getting newly created song with another artist")

		resSong, err := svc.GetSongByID(context.Background(), song.ID)
		assert.NoError(t, err, "expected no error when getting original song")

		assert.NotEqual(t, resNewSong.ID, resSong.ID, "expected ids not to match, got %d and %d", resNewSong.ID, resSong.ID)
		assert.Equal(t, resNewSong.Title, resSong.Title, "expected titles to match, got %q and %q", resNewSong.Title, resSong.Title)
		assert.NotEqual(t, resNewSong.Sheet, resSong.Sheet, "expected sheets to be different, got same content")
	})

}
