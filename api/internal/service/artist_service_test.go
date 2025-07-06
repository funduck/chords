package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/orm"
	"gorm.io/gorm"
)

func initForTest() *gorm.DB {
	config.InitForTest()
	db, _ := orm.InitForTest()
	return db
}

func TestArtistService_normalizeName(t *testing.T) {
	service := NewArtistService()

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Basic lowercase",
			input:    "John Doe",
			expected: "johndoe",
		},
		{
			name:     "With special characters",
			input:    "AC/DC",
			expected: "acdc",
		},
		{
			name:     "With multiple spaces and punctuation",
			input:    "The  Beatles!",
			expected: "thebeatles",
		},
		{
			name:     "With numbers",
			input:    "Blink-182",
			expected: "blink182",
		},
		{
			name:     "With accented characters",
			input:    "Björk",
			expected: "bjrk",
		},
		{
			name:     "Already normalized",
			input:    "artist",
			expected: "artist",
		},
		{name: "With repeated letters",
			input:    "A C C D C",
			expected: "acdc",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := service.normalizeName(tt.input)
			if result != tt.expected {
				t.Errorf("normalizeName(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestArtistService_CreateIfNotExists(t *testing.T) {
	db := initForTest()
	service := NewArtistService()
	ctx := orm.SetDB(context.Background(), db)

	t.Run("Create new artist", func(t *testing.T) {
		artist, err := service.CreateIfNotExists(ctx, "John Doe")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if artist.Name != "John Doe" {
			t.Errorf("Expected name 'John Doe', got %q", artist.Name)
		}

		if artist.NameNormalized != "johndoe" {
			t.Errorf("Expected normalized name 'johndoe', got %q", artist.NameNormalized)
		}

		if artist.ID == 0 {
			t.Error("Expected artist to have an ID")
		}
	})

	t.Run("Return existing artist with same normalized name", func(t *testing.T) {
		// Create first artist
		artist1, err := service.CreateIfNotExists(ctx, "AC/DC")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Try to create artist with different formatting but same normalized name
		artist2, err := service.CreateIfNotExists(ctx, "A C D C")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if artist1.ID != artist2.ID {
			t.Errorf("Expected same artist ID, got %d and %d", artist1.ID, artist2.ID)
		}

		if artist2.Name != "AC/DC" {
			t.Errorf("Expected original name 'AC/DC', got %q", artist2.Name)
		}
	})

	t.Run("Create different artists with different normalized names", func(t *testing.T) {
		artist1, err := service.CreateIfNotExists(ctx, "The Beatles")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		artist2, err := service.CreateIfNotExists(ctx, "The Rolling Stones")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if artist1.ID == artist2.ID {
			t.Error("Expected different artist IDs")
		}

		if artist1.NameNormalized == artist2.NameNormalized {
			t.Error("Expected different normalized names")
		}
	})
}

func TestArtistService_FindByName(t *testing.T) {
	db := initForTest()
	service := NewArtistService()
	ctx := orm.SetDB(context.Background(), db)

	// Create test artist
	created, err := service.CreateIfNotExists(ctx, "Test Artist")
	if err != nil {
		t.Fatalf("Failed to create test artist: %v", err)
	}

	t.Run("Find existing artist by exact name", func(t *testing.T) {
		found, err := service.FindByName(ctx, "Test Artist")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if found == nil {
			t.Fatal("Expected to find artist, got nil")
		}

		if found.ID != created.ID {
			t.Errorf("Expected ID %d, got %d", created.ID, found.ID)
		}
	})

	t.Run("Return nil for non-existent artist", func(t *testing.T) {
		found, err := service.FindByName(ctx, "Non-existent Artist")
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if found != nil {
			t.Error("Expected nil, got artist")
		}
	})
}

func TestArtistService_SearchArtists(t *testing.T) {
	db := initForTest()
	service := NewArtistService()
	ctx := orm.SetDB(context.Background(), db)

	// Create test artists
	testArtists := []string{
		"The Beatles",
		"The Rolling Stones",
		"Beatles Tribute Band",
		"AC/DC",
		"Metallica",
	}

	for _, name := range testArtists {
		_, err := service.CreateIfNotExists(ctx, name)
		if err != nil {
			t.Fatalf("Failed to create test artist %s: %v", name, err)
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
}
