package service

import (
	"context"
	"regexp"
	"strings"

	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type ArtistService struct{}

func NewArtistService() *ArtistService {
	return &ArtistService{}
}

// normalizeName normalizes artist name for comparison by converting to lowercase
// and removing special characters and spaces
func (s *ArtistService) normalizeName(name string) string {
	// Convert to lowercase
	normalized := strings.ToLower(name)

	// Remove special characters and spaces, keep only alphanumeric
	reg := regexp.MustCompile(`[^a-z0-9]`)
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

// CreateIfNotExists creates an artist if it doesn't already exist based on name comparison
func (s *ArtistService) CreateIfNotExists(ctx context.Context, name string) (*entity.Artist, error) {
	// First check if artist already exists
	existing, err := s.FindByName(ctx, name)
	if err != nil {
		return nil, err
	}

	if existing != nil {
		return existing, nil
	}

	// Create new artist
	db := orm.GetDB(ctx)
	artist := &entity.Artist{
		Name:           name,
		NameNormalized: s.normalizeName(name),
	}

	err = db.Create(artist).Error
	if err != nil {
		return nil, err
	}

	return artist, nil
}

// SearchArtists performs search on artists using either FTS or LIKE search
func (s *ArtistService) SearchArtists(ctx context.Context, req *dto.SearchArtistRequest) (*entity.ArtistsList, error) {
	tx := orm.GetDB(ctx)

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	q := tx.Model(&entity.Artist{})

	if req.Query != "" {
		q = orm.SearchFTS(q, "artists", req.Query)
	}
	if req.CursorAfter != "" {
		// Use cursor for pagination
		normalizedCursor := s.normalizeName(req.CursorAfter)
		q = q.Where("name_normalized > ?", normalizedCursor)
	}
	if req.CursorBefore != "" {
		// Use cursor for pagination
		normalizedCursor := s.normalizeName(req.CursorBefore)
		q = q.Where("name_normalized < ?", normalizedCursor)
	}

	// Count total number of matching artists
	var total int64
	if req.ReturnTotal {
		err := q.Count(&total).Error
		if err != nil {
			return nil, err
		}
	}

	var artists []*entity.ArtistInfo
	if req.ReturnRows {
		// Find artists with pagination
		err := q.
			Order("artists.name_normalized ASC").
			Limit(req.Limit).
			Find(&artists).Error
		if err != nil {
			return nil, err
		}
		// Populate cursors for pagination
		for _, artist := range artists {
			artist.Cursor = artist.NameNormalized
		}
	}

	return &entity.ArtistsList{Artists: artists, Total: total}, nil
}
