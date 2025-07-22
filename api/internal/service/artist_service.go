package service

import (
	"context"
	"regexp"
	"strings"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type ArtistService struct {
}

func NewArtistService() *ArtistService {
	return &ArtistService{}
}

// normalizeName normalizes artist name for comparison by converting to lowercase
// and removing special characters and spaces
func (s *ArtistService) normalizeName(name string) string {
	// Convert to lowercase
	normalized := strings.ToLower(name)

	// Remove special characters and spaces, keep only alphanumeric
	reg := regexp.MustCompile(`[^a-zA-Z0-9а-яА-Я]`)
	normalized = reg.ReplaceAllString(normalized, "")

	// Remove repeated letters
	var prev rune
	var normalizedRunes []rune
	for _, r := range normalized {
		if r != prev {
			normalizedRunes = append(normalizedRunes, r)
		}
		prev = r
	}
	normalized = string(normalizedRunes)

	return normalized
}

// FindByName finds an artist by exact name match
func (s *ArtistService) FindByName(ctx context.Context, name string) (*entity.Artist, error) {
	db := orm.GetDB(ctx)

	var artist entity.Artist
	err := db.Where("name = ?", name).First(&artist).Error
	if err != nil {
		if orm.IsRecordNotFoundError(err) {
			return nil, nil
		}
		return nil, err
	}

	return &artist, nil
}

// GetArtistByID retrieves an artist by its ID
func (s *ArtistService) GetArtistByID(ctx context.Context, id uint) (*entity.Artist, error) {
	db := orm.GetDB(ctx)
	var artist entity.Artist
	err := db.Model(&entity.Artist{}).First(&artist, id).Error

	return &artist, err
}

// CreateIfNotExists creates an artist if it doesn't already exist based on name comparison
func (s *ArtistService) CreateIfNotExists(ctx context.Context, artist *entity.Artist) error {
	// First check if artist already exists by normalized name
	normalized := s.normalizeName(artist.Name)
	db := orm.GetDB(ctx)

	var existing entity.Artist
	err := db.Where("name_normalized = ?", normalized).First(&existing).Error
	if err == nil {
		// Artist with same normalized name already exists, return it
		*artist = existing
		return nil
	}
	if !orm.IsRecordNotFoundError(err) {
		return err // Some other error occurred
	}

	artist.NameNormalized = normalized

	return db.Create(artist).Error
}
