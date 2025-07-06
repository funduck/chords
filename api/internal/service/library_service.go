package service

import (
	"context"

	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

type LibraryService struct {
	userService *UserService
}

var publicLibraryServiceInstance *LibraryService

func NewLibraryService() *LibraryService {
	if publicLibraryServiceInstance != nil {
		return publicLibraryServiceInstance
	}
	publicLibraryServiceInstance = &LibraryService{
		userService: NewUserService(),
	}
	return publicLibraryServiceInstance
}

func (s *LibraryService) EnsurePublicLibrary(ctx context.Context, name string) (*entity.Library, error) {
	tx := orm.GetDB(ctx)
	var library entity.Library
	err := tx.Model(&entity.Library{}).
		Where("type = ?", entity.LibraryType_Public).
		Where("name = ?", name).
		First(&library).Error
	if err == nil {
		return &library, err
	}
	if !orm.IsRecordNotFoundError(err) {
		return nil, err // Some other error occurred
	}
	// Library not found, create it
	library = entity.Library{Name: name, Type: entity.LibraryType_Public}
	err = tx.Create(&library).Error
	return &library, err
}

func (s *LibraryService) SearchSongs(ctx context.Context, req *dto.SearchSongRequest) (*entity.SongsList, error) {
	tx := orm.GetDB(ctx)

	if req.Limit <= 0 {
		req.Limit = -1 // Default to no limit
	}

	q := tx.Model(&entity.Song{}).
		Joins("JOIN library_songs ls ON ls.song_id = songs.id")

	if req.LibraryID != 0 {
		q = q.Where("libraries.id = ?", req.LibraryID)
	}
	if req.LibraryType != "" {
		q = q.Where("libraries.library_type = ?", req.LibraryType)
		if req.LibraryType == entity.LibraryType_Private || req.LibraryType == entity.LibraryType_Favorites {
			user, err := s.userService.GetActiveUser(ctx)
			if err != nil {
				return nil, err
			}
			q = q.Where("libraries.owner_id = ?", user.ID)
		}
	}

	if req.ArtistID != 0 {
		q = q.Where("songs.id IN (SELECT song_id FROM song_artists WHERE artist_id = ?) OR songs.id IN (SELECT song_id FROM song_composers WHERE artist_id = ?)", req.ArtistID, req.ArtistID)
	}

	if req.Query != "" {
		q = orm.SearchFTS(q, "songs", req.Query)
	}
	if req.CursorAfter != "" {
		q = q.Where("songs.title > ?", req.CursorAfter)
	}
	if req.CursorBefore != "" {
		q = q.Where("songs.title < ?", req.CursorBefore)
	}

	// Count total number of matching songs
	var total int64
	if req.ReturnTotal {
		err := q.Count(&total).Error
		if err != nil {
			return nil, err
		}
	}

	var songs []*entity.SongInfo
	if req.ReturnRows {
		// Find songs with pagination
		err := q.
			Order("songs.title ASC").
			Limit(req.Limit).
			Find(&songs).Error
		if err != nil {
			return nil, err
		}
		// Populate cursors for pagination
		for _, song := range songs {
			song.Cursor = song.Title // Use song title as cursor
		}
		// TODO preload other fields if needed
	}

	return &entity.SongsList{Songs: songs, Total: total}, nil
}

func (s *LibraryService) AddSongToLibrary(ctx context.Context, library *entity.Library, song *entity.Song) error {
	log := logger.GetLogger(ctx)
	tx := orm.GetDB(ctx)

	// Check if the song already exists in the public library
	var c int64
	err := tx.Model(&entity.Song{}).
		Joins("JOIN library_songs ls ON ls.song_id = songs.id").
		Where("ls.library_id = ?", library.ID).
		Where("ls.song_id = ?", song.ID).
		Count(&c).Error
	if c > 0 {
		log.Infof("Song already exists in library %d: %d", library.ID, song.ID)
		return nil
	}
	if err != nil {
		return err // Some other error occurred
	}

	err = tx.Model(&library).Association("Songs").Append([]*entity.Song{song})
	return err
}
