package service

import (
	"context"
	"testing"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func initSearchForTest() *gorm.DB {
	config.InitForTest()
	db, _ := orm.InitForTest()
	return db
}

func TestSearchService_SearchArtists(t *testing.T) {
	db := initSearchForTest()
	service := NewSearchService()
	libraryService := NewLibraryService()
	ctx := orm.WithDB(context.Background(), db)

	user := &entity.User{}
	err := db.Create(user).Error
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}
	accessToken := &auth.AccessToken{UserID: user.ID}
	ctx = auth.WithAccessToken(ctx, accessToken)

	// Create test artists
	testArtists := []string{
		"The Beatles",
		"The Rolling Stones",
		"Beatles Tribute Band",
		"AC/DC",
		"Metallica",
	}

	pubLib, err := libraryService.EnsurePublicLibrary(ctx, "Test Library")
	if err != nil {
		t.Fatalf("Failed to create public library: %v", err)
	}
	privLib, err := libraryService.EnsureUserLibrary(ctx, user.ID)
	if err != nil {
		t.Fatalf("Failed to create private library: %v", err)
	}

	artistService := NewArtistService()
	for i, name := range testArtists {
		a := &entity.Artist{Name: name}
		err = artistService.CreateIfNotExists(ctx, a)
		if err != nil {
			t.Fatalf("Failed to create test artist %s: %v", name, err)
		}
		err = libraryService.AddArtistToLibrary(ctx, pubLib, a)
		if err != nil {
			t.Fatalf("Failed to add artist %s to public library: %v", name, err)
		}
		if i == 1 {
			err = libraryService.AddArtistToLibrary(ctx, privLib, a)
			if err != nil {
				t.Fatalf("Failed to add artist %s to private library: %v", name, err)
			}
		}
	}

	t.Run("Search with LIKE query", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "Beatles",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 2 {
			t.Errorf("Expected 2 artists, got %d", response.Total)
		}

		if len(response.Artists) != 2 {
			t.Errorf("Expected 2 artists in response, got %d", len(response.Artists))
		}

		// Check that both Beatles-related artists are returned
		foundNames := make(map[string]bool)
		for _, artist := range response.Artists {
			foundNames[artist.Name] = true
		}

		if !foundNames["The Beatles"] {
			t.Error("Expected to find 'The Beatles' in search results")
		}
		if !foundNames["Beatles Tribute Band"] {
			t.Error("Expected to find 'Beatles Tribute Band' in search results")
		}
	})

	t.Run("Search with case insensitive", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "metallica",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 1 {
			t.Errorf("Expected 1 artist, got %d", response.Total)
		}

		if len(response.Artists) != 1 {
			t.Errorf("Expected 1 artist in response, got %d", len(response.Artists))
		}

		if response.Artists[0].Name != "Metallica" {
			t.Errorf("Expected 'Metallica', got %q", response.Artists[0].Name)
		}
	})

	t.Run("Search with pagination", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "The",
			Limit:       1,
			ReturnRows:  true,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 2 {
			t.Errorf("Expected total 2 artists, got %d", response.Total)
		}

		if len(response.Artists) != 1 {
			t.Errorf("Expected 1 artist in response (due to limit), got %d", len(response.Artists))
		}

		// Test second page
		req.CursorAfter = response.Artists[0].Cursor
		response, err = service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(response.Artists) != 1 {
			t.Errorf("Expected 1 artist in second page, got %d", len(response.Artists))
		}
	})

	t.Run("Search with no results", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "NonExistentArtist",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 0 {
			t.Errorf("Expected 0 artists, got %d", response.Total)
		}

		if len(response.Artists) != 0 {
			t.Errorf("Expected 0 artists in response, got %d", len(response.Artists))
		}
	})

	t.Run("Search with ReturnRows false", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "Beatles",
			Limit:       10,
			ReturnRows:  false,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 2 {
			t.Errorf("Expected 2 artists, got %d", response.Total)
		}

		if len(response.Artists) != 0 {
			t.Errorf("Expected 0 artists in response when ReturnRows=false, got %d", len(response.Artists))
		}
	})

	t.Run("Search with ReturnTotal false", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "Beatles",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: false,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 0 {
			t.Errorf("Expected 0 total when ReturnTotal=false, got %d", response.Total)
		}

		if len(response.Artists) != 2 {
			t.Errorf("Expected 2 artists in response, got %d", len(response.Artists))
		}
	})

	t.Run("Search in private library", func(t *testing.T) {
		req := &dto.SearchArtistRequest{
			Query:       "Rolling",
			LibraryType: entity.LibraryType_Private,
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		}

		response, err := service.SearchArtists(ctx, req)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if response.Total != 1 {
			t.Errorf("Expected 1 total when ReturnTotal=false, got %d", response.Total)
		}

		if len(response.Artists) != 1 {
			t.Errorf("Expected 1 artists in response, got %d", len(response.Artists))
		}
	})

	t.Run("SongCount and CompositionCount", func(t *testing.T) {
		// Get The Beatles and Metallica artists
		var beatles, metallica entity.Artist
		err := db.Where("name = ?", "The Beatles").First(&beatles).Error
		if err != nil {
			t.Fatalf("Failed to find The Beatles: %v", err)
		}
		err = db.Where("name = ?", "Metallica").First(&metallica).Error
		if err != nil {
			t.Fatalf("Failed to find Metallica: %v", err)
		}

		// Create songs where Beatles is artist and Metallica is composer
		for i := 0; i < 3; i++ {
			song := &entity.Song{
				Title:     "Beatles Song " + string(rune('A'+i)),
				Artists:   []*entity.Artist{&beatles},
				Composers: []*entity.Artist{&metallica},
				Format:    entity.SheetFormat_Chordpro,
				Sheet:     "Test sheet",
				Lyrics:    "Test lyrics",
				OwnerID:   user.ID,
			}
			err = db.Create(song).Error
			if err != nil {
				t.Fatalf("Failed to create song: %v", err)
			}
			err = libraryService.AddSongToLibrary(ctx, pubLib, song)
			if err != nil {
				t.Fatalf("Failed to add song to library: %v", err)
			}
		}

		// Create songs where Metallica is both artist and composer
		for i := 0; i < 2; i++ {
			song := &entity.Song{
				Title:     "Metallica Song " + string(rune('A'+i)),
				Artists:   []*entity.Artist{&metallica},
				Composers: []*entity.Artist{&metallica},
				Format:    entity.SheetFormat_Chordpro,
				Sheet:     "Test sheet",
				Lyrics:    "Test lyrics",
				OwnerID:   user.ID,
			}
			err = db.Create(song).Error
			if err != nil {
				t.Fatalf("Failed to create song: %v", err)
			}
			err = libraryService.AddSongToLibrary(ctx, pubLib, song)
			if err != nil {
				t.Fatalf("Failed to add song to library: %v", err)
			}
		}

		// Search for Beatles
		response, err := service.SearchArtists(ctx, &dto.SearchArtistRequest{
			Query:       "The Beatles",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(response.Artists) < 1 {
			t.Fatalf("Expected at least 1 artist, got %d", len(response.Artists))
		}

		beatlesInfo := response.Artists[0]
		assert.Equal(t, "The Beatles", beatlesInfo.Name)
		assert.Equal(t, int64(3), beatlesInfo.SongCount, "Expected Beatles to have 3 songs")
		assert.Equal(t, int64(0), beatlesInfo.CompositionCount, "Expected Beatles to have 0 compositions")

		// Search for Metallica
		response, err = service.SearchArtists(ctx, &dto.SearchArtistRequest{
			Query:       "Metallica",
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		})
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if len(response.Artists) < 1 {
			t.Fatalf("Expected at least 1 artist, got %d", len(response.Artists))
		}

		metallicaInfo := response.Artists[0]
		assert.Equal(t, "Metallica", metallicaInfo.Name)
		assert.Equal(t, int64(2), metallicaInfo.SongCount, "Expected Metallica to have 2 songs as artist")
		assert.Equal(t, int64(5), metallicaInfo.CompositionCount, "Expected Metallica to have 5 compositions (3 Beatles songs + 2 own songs)")
	})
}

func TestSearchService_SearchSongs(t *testing.T) {
	config.InitForTest()
	orm.InitForTest()

	service := NewSearchService()

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
		Lyrics:  "This is a test song With some lyrics",
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
		Type:  entity.LibraryType_Public,
		Songs: []*entity.Song{&song},
	}
	err = tx.Create(&library).Error
	assert.NoError(t, err, "failed to create test library")

	t.Run("Search finds some", func(t *testing.T) {
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
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
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query:       "with some lyrics",
			ByLyrics:    true,
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
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
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
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
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
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query: "Test",
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Empty(t, res.Songs, "expected no songs to be returned when ReturnRows is false")
	})

	t.Run("Search by lyrics is empty", func(t *testing.T) {
		res, err := service.SearchSongs(context.Background(), &dto.SearchSongRequest{
			Query: "nonexistent lyrics",
		})
		assert.NoError(t, err, "expected no error when searching songs")
		assert.NotNil(t, res, "expected search results to be returned")
		assert.Empty(t, res.Songs, "expected no songs to be returned for nonexistent lyrics")
	})
}
