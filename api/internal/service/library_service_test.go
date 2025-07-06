package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestLibraryService(t *testing.T) {
	config.InitForTest()
	orm.InitForTest()

	svc := NewLibraryService()

	tx := orm.GetDBInstance()
	var err error

	// Create test data
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

	song2 := entity.Song{
		Title:   "Another Test Song",
		Artists: []*entity.Artist{&artist},
		Format:  "chordpro",
		Sheet: `
		{title: Another Test Song}
		{artist: Test Artist}
		Verse 1:
		[G]Another [D]test [G]song
		[Em]With different [C]lyrics`,
	}
	err = tx.Create(&song2).Error
	assert.NoError(t, err, "failed to create second test song")
	t.Run("EnsurePublicLibrary creates new library", func(t *testing.T) {
		ctx := context.Background()
		libraryName := "Test Public Library"

		library, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when creating public library")
		assert.NotNil(t, library, "expected library to be created")
		assert.Equal(t, libraryName, library.Name, "expected library name %q, got %q", libraryName, library.Name)
		assert.Equal(t, entity.LibraryType_Public, library.Type, "expected library type %q, got %q", entity.LibraryType_Public, library.Type)
		assert.NotZero(t, library.ID, "expected library ID to be set")
	})
	t.Run("EnsurePublicLibrary returns existing library", func(t *testing.T) {
		ctx := context.Background()
		libraryName := "Test Public Library"

		// First call - should return existing library
		library1, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when getting existing public library")
		assert.NotNil(t, library1, "expected library to be returned")

		// Second call - should return the same library
		library2, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when getting existing public library again")
		assert.NotNil(t, library2, "expected library to be returned again")
		assert.Equal(t, library1.ID, library2.ID, "expected same library ID %d, got %d", library1.ID, library2.ID)
		assert.Equal(t, library1.Name, library2.Name, "expected same library name %q, got %q", library1.Name, library2.Name)
		assert.Equal(t, library1.Type, library2.Type, "expected same library type %q, got %q", library1.Type, library2.Type)
	})
	t.Run("EnsurePublicLibrary with different names creates different libraries", func(t *testing.T) {
		ctx := context.Background()
		libraryName1 := "First Public Library"
		libraryName2 := "Second Public Library"

		library1, err := svc.EnsurePublicLibrary(ctx, libraryName1)
		assert.NoError(t, err, "expected no error when creating first public library")
		assert.NotNil(t, library1, "expected first library to be created")

		library2, err := svc.EnsurePublicLibrary(ctx, libraryName2)
		assert.NoError(t, err, "expected no error when creating second public library")
		assert.NotNil(t, library2, "expected second library to be created")

		assert.NotEqual(t, library1.ID, library2.ID, "expected different library IDs, got same ID %d", library1.ID)
		assert.Equal(t, libraryName1, library1.Name, "expected first library name %q, got %q", libraryName1, library1.Name)
		assert.Equal(t, libraryName2, library2.Name, "expected second library name %q, got %q", libraryName2, library2.Name)
	})

	t.Run("AddSongToLibrary adds song successfully", func(t *testing.T) {
		ctx := context.Background()
		libraryName := "Song Test Library"

		library, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when creating library")
		assert.NotNil(t, library, "expected library to be created")

		err = svc.AddSongToLibrary(ctx, library, &song)
		assert.NoError(t, err, "expected no error when adding song to library")

		// Verify song was added by checking the association
		var count int64
		err = tx.Model(&entity.Song{}).
			Joins("JOIN library_songs ls ON ls.song_id = songs.id").
			Where("ls.library_id = ?", library.ID).
			Where("ls.song_id = ?", song.ID).
			Count(&count).Error
		assert.NoError(t, err, "expected no error when counting songs in library")
		assert.Equal(t, int64(1), count, "expected song count %d, got %d", 1, count)
	})

	t.Run("AddSongToLibrary handles duplicate songs", func(t *testing.T) {
		ctx := context.Background()
		libraryName := "Duplicate Test Library"

		library, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when creating library")
		assert.NotNil(t, library, "expected library to be created")

		// Add song first time
		err = svc.AddSongToLibrary(ctx, library, &song)
		assert.NoError(t, err, "expected no error when adding song to library first time")

		// Add same song second time - should not error
		err = svc.AddSongToLibrary(ctx, library, &song)
		assert.NoError(t, err, "expected no error when adding duplicate song to library")

		// Verify song exists only once
		var count int64
		err = tx.Model(&entity.Song{}).
			Joins("JOIN library_songs ls ON ls.song_id = songs.id").
			Where("ls.library_id = ?", library.ID).
			Where("ls.song_id = ?", song.ID).
			Count(&count).Error
		assert.NoError(t, err, "expected no error when counting songs in library")
		assert.Equal(t, int64(1), count, "expected song count %d, got %d", 1, count)
	})

	t.Run("AddSongToLibrary adds multiple songs", func(t *testing.T) {
		ctx := context.Background()
		libraryName := "Multiple Songs Library"

		library, err := svc.EnsurePublicLibrary(ctx, libraryName)
		assert.NoError(t, err, "expected no error when creating library")
		assert.NotNil(t, library, "expected library to be created")

		// Add first song
		err = svc.AddSongToLibrary(ctx, library, &song)
		assert.NoError(t, err, "expected no error when adding first song to library")

		// Add second song
		err = svc.AddSongToLibrary(ctx, library, &song2)
		assert.NoError(t, err, "expected no error when adding second song to library")

		// Verify both songs are in the library
		var count int64
		err = tx.Model(&entity.Song{}).
			Joins("JOIN library_songs ls ON ls.song_id = songs.id").
			Where("ls.library_id = ?", library.ID).
			Count(&count).Error
		assert.NoError(t, err, "expected no error when counting songs in library")
		assert.Equal(t, int64(2), count, "expected song count %d, got %d", 2, count)
	})

	t.Run("AddSongToLibrary works with different libraries", func(t *testing.T) {
		ctx := context.Background()
		libraryName1 := "Library One"
		libraryName2 := "Library Two"

		library1, err := svc.EnsurePublicLibrary(ctx, libraryName1)
		assert.NoError(t, err, "expected no error when creating first library")
		assert.NotNil(t, library1, "expected first library to be created")

		library2, err := svc.EnsurePublicLibrary(ctx, libraryName2)
		assert.NoError(t, err, "expected no error when creating second library")
		assert.NotNil(t, library2, "expected second library to be created")

		// Add same song to both libraries
		err = svc.AddSongToLibrary(ctx, library1, &song)
		assert.NoError(t, err, "expected no error when adding song to first library")

		err = svc.AddSongToLibrary(ctx, library2, &song)
		assert.NoError(t, err, "expected no error when adding song to second library") // Verify song is in both libraries
		var count1 int64
		err = tx.Model(&entity.Song{}).
			Joins("JOIN library_songs ls ON ls.song_id = songs.id").
			Where("ls.library_id = ?", library1.ID).
			Where("ls.song_id = ?", song.ID).
			Count(&count1).Error
		assert.NoError(t, err, "expected no error when counting songs in first library")
		assert.Equal(t, int64(1), count1, "expected song count %d in first library, got %d", 1, count1)

		var count2 int64
		err = tx.Model(&entity.Song{}).
			Joins("JOIN library_songs ls ON ls.song_id = songs.id").
			Where("ls.library_id = ?", library2.ID).
			Where("ls.song_id = ?", song.ID).
			Count(&count2).Error
		assert.NoError(t, err, "expected no error when counting songs in second library")
		assert.Equal(t, int64(1), count2, "expected song count %d in second library, got %d", 1, count2)
	})

	t.Run("NewLibraryService returns singleton", func(t *testing.T) {
		svc1 := NewLibraryService()
		svc2 := NewLibraryService()

		assert.Equal(t, svc1, svc2, "expected NewLibraryService to return the same instance")
	})
}
