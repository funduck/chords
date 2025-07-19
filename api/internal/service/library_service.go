package service

import (
	"context"

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

func (s *LibraryService) EnsureUserLibrary(ctx context.Context, userID uint) (*entity.Library, error) {
	tx := orm.GetDB(ctx)
	var library entity.Library
	err := tx.Model(&entity.Library{}).
		Where("type = ?", entity.LibraryType_Private).
		Where("owner_id = ?", userID).
		First(&library).Error
	if err == nil {
		return &library, err
	}
	if !orm.IsRecordNotFoundError(err) {
		return nil, err // Some other error occurred
	}
	// Library not found, create it
	library = entity.Library{OwnerID: userID, Type: entity.LibraryType_Private, Name: "My Library"}
	err = tx.Create(&library).Error
	return &library, err
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
