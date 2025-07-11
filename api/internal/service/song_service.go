package service

import (
	"context"

	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"gorm.io/gorm/clause"
)

type SongService struct {
	userService *UserService
}

var songServiceInstance *SongService

func NewSongService() *SongService {
	if songServiceInstance != nil {
		return songServiceInstance
	}
	songServiceInstance = &SongService{
		userService: NewUserService(),
	}
	return songServiceInstance
}

func (s *SongService) GetSongByID(ctx context.Context, id uint) (*entity.Song, error) {
	tx := orm.GetDB(ctx)
	var song entity.Song
	err := tx.Model(&entity.Song{}).Preload(clause.Associations).First(&song, id).Error

	// TODO check access rights when song is private

	return &song, err
}

func (s *SongService) CreateIfNotExists(ctx context.Context, song *entity.Song) (*entity.Song, error) {
	tx := orm.GetDB(ctx)

	// Check if song already exists
	var existingSong entity.Song
	err := tx.Model(&entity.Song{}).
		Where("songs.title = ?", song.Title).
		Where("songs.owner_id = ?", song.OwnerID).
		First(&existingSong).Error
	if err == nil {
		return &existingSong, nil // Song already exists
	}
	if !orm.IsRecordNotFoundError(err) {
		return nil, err // Some other error occurred
	}

	// Create new song
	err = tx.Create(song).Error
	if err != nil {
		return nil, err
	}

	return song, nil
}

func (s *SongService) SearchSongs(ctx context.Context, req *dto.SearchSongRequest) (*entity.SongsList, error) {
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
