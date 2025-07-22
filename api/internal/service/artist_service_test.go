package service

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
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
		{name: "Cyrillic characters",
			input:    "Пример",
			expected: "пример",
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
	ctx := orm.WithDB(context.Background(), db)

	t.Run("Create new artist", func(t *testing.T) {
		artist := &entity.Artist{Name: "John Doe"}
		err := service.CreateIfNotExists(ctx, artist)
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
		artist1 := &entity.Artist{Name: "AC/DC"}
		err := service.CreateIfNotExists(ctx, artist1)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		// Try to create artist with different formatting but same normalized name
		artist2 := &entity.Artist{Name: "A C D C"}
		err = service.CreateIfNotExists(ctx, artist2)
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
		artist1 := &entity.Artist{Name: "The Beatles"}
		err := service.CreateIfNotExists(ctx, artist1)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		artist2 := &entity.Artist{Name: "The Rolling Stones"}
		err = service.CreateIfNotExists(ctx, artist2)
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
	ctx := orm.WithDB(context.Background(), db)

	// Create test artist
	created := &entity.Artist{Name: "Test Artist"}
	err := service.CreateIfNotExists(ctx, created)
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

func TestArtistService_GetArtistByID(t *testing.T) {
	db := initForTest()
	service := NewArtistService()
	ctx := orm.WithDB(context.Background(), db)

	// Create test artist
	created := &entity.Artist{Name: "Test Artist"}
	err := service.CreateIfNotExists(ctx, created)
	if err != nil {
		t.Fatalf("Failed to create test artist: %v", err)
	}

	t.Run("Get existing artist by ID", func(t *testing.T) {
		found, err := service.GetArtistByID(ctx, created.ID)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}

		if found == nil {
			t.Fatal("Expected to find artist, got nil")
		}

		if found.ID != created.ID {
			t.Errorf("Expected ID %d, got %d", created.ID, found.ID)
		}

		if found.Name != created.Name {
			t.Errorf("Expected name %q, got %q", created.Name, found.Name)
		}
	})

	t.Run("Return error for non-existent artist", func(t *testing.T) {
		_, err := service.GetArtistByID(ctx, 999) // Non-existent ID
		if err == nil {
			t.Error("Expected error for non-existent artist, got nil")
		}
	})
}
