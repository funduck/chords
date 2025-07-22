package service

import (
	"context"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type SearchService struct {
	artistService *ArtistService
}

func NewSearchService() *SearchService {
	return &SearchService{
		artistService: NewArtistService(),
	}
}

func (s *SearchService) SearchArtists(ctx context.Context, req *dto.SearchArtistRequest) (*entity.ArtistsList, error) {
	tx := orm.GetDB(ctx)

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	q := tx.Model(&entity.Artist{})

	// Apply library filtering if specified
	if req.LibraryType == "" {
		req.LibraryType = entity.LibraryType_Public
	}
	if req.LibraryType != entity.LibraryType_Public {
		q = q.Joins("JOIN library_artists la ON la.artist_id = artists.id").
			Joins("JOIN libraries l ON l.id = la.library_id").
			Where("l.type = ?", req.LibraryType)

		if req.LibraryType == entity.LibraryType_Private || req.LibraryType == entity.LibraryType_Favorites {
			accessToken, err := auth.GetAccessToken(ctx)
			if err != nil {
				return nil, err
			}
			q = q.Where("l.owner_id = ?", accessToken.UserID)
		}
	}

	if req.Query != "" {
		normalizedName := s.artistService.normalizeName(req.Query)
		if len(normalizedName) > 3 {
			q = q.Where("("+orm.SearchFTS("artists")+"OR name_normalized LIKE ?)", req.Query, "%"+normalizedName+"%")
		} else {
			q = q.Where(orm.SearchFTS("artists"), req.Query)
		}
	}

	// Count total number of matching artists
	var total int64
	if req.ReturnTotal {
		err := q.Count(&total).Error
		if err != nil {
			return nil, err
		}
	}

	artistsList := []*entity.ArtistInfo{}
	if req.ReturnRows {
		var artists []*entity.Artist

		if req.CursorAfter != "" {
			// Use cursor for pagination
			normalizedCursor := s.artistService.normalizeName(req.CursorAfter)
			q = q.Where("name_normalized > ?", normalizedCursor)
		}
		if req.CursorBefore != "" {
			// Use cursor for pagination
			normalizedCursor := s.artistService.normalizeName(req.CursorBefore)
			q = q.Where("name_normalized < ?", normalizedCursor)
		}

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
			listItem := &entity.ArtistInfo{
				Artist: *artist,
				Cursor: artist.NameNormalized,
			}
			artistsList = append(artistsList, listItem)
		}
	}

	return &entity.ArtistsList{Artists: artistsList, Total: total}, nil
}

func (s *SearchService) SearchSongs(ctx context.Context, req *dto.SearchSongRequest) (*entity.SongsList, error) {
	tx := orm.GetDB(ctx)

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	q := tx.Model(&entity.Song{}).
		Joins("JOIN library_songs ON library_songs.song_id = songs.id").
		Joins("JOIN libraries ON libraries.id = library_songs.library_id")

	if req.LibraryID != 0 {
		q = q.Where("libraries.id = ?", req.LibraryID)
	}
	if req.LibraryType == "" {
		req.LibraryType = entity.LibraryType_Public
	}
	if req.LibraryType != "" {
		q = q.Where("libraries.type = ?", req.LibraryType)
		if req.LibraryType == entity.LibraryType_Private || req.LibraryType == entity.LibraryType_Favorites {
			accessToken, err := auth.GetAccessToken(ctx)
			if err != nil {
				return nil, err
			}
			q = q.Where("libraries.owner_id = ?", accessToken.UserID)
		}
	}

	if req.ArtistID != 0 {
		q = q.Where("songs.id IN (SELECT song_id FROM song_artists WHERE artist_id = ?) OR songs.id IN (SELECT song_id FROM song_composers WHERE artist_id = ?)", req.ArtistID, req.ArtistID)
	}

	if req.Query != "" {
		q = q.Where(orm.SearchFTS("songs"), req.Query)
	}

	// Count total number of matching songs
	var total int64
	if req.ReturnTotal {
		err := q.Count(&total).Error
		if err != nil {
			return nil, err
		}
	}

	songsList := []*entity.SongInfo{}
	if req.ReturnRows {
		var songs []*entity.Song

		if req.CursorAfter != "" {
			q = q.Where("songs.title > ?", req.CursorAfter)
		}
		if req.CursorBefore != "" {
			q = q.Where("songs.title < ?", req.CursorBefore)
		}

		// Find songs with pagination
		err := q.
			Preload("Artists").
			Preload("Composers").
			Order("songs.title ASC").
			Limit(req.Limit).
			Find(&songs).Error
		if err != nil {
			return nil, err
		}
		// Populate cursors for pagination
		for _, song := range songs {
			listItem := &entity.SongInfo{
				Song:   *song,
				Cursor: song.Title, // Use song title as cursor
			}
			songsList = append(songsList, listItem)
		}
	}

	return &entity.SongsList{Songs: songsList, Total: total}, nil
}
