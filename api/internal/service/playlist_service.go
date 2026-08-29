package service

import (
	"context"
	"errors"
	"strings"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

// ErrPlaylistNameEmpty is returned when a playlist is created with a blank name.
var ErrPlaylistNameEmpty = errors.New("playlist name must not be empty")

type PlaylistService struct {
	log          logger.Logger
	shareService *ShareService
}

func NewPlaylistService() *PlaylistService {
	return &PlaylistService{
		log:          logger.NewForModule("PlaylistService"),
		shareService: NewShareService(),
	}
}

// ListPlaylists returns the playlists of ownerID, with their song counts. An
// ownerID of 0 (or the current user's own id) lists the caller's playlists;
// any other owner requires a redeemed share link.
func (s *PlaylistService) ListPlaylists(ctx context.Context, currentUserID uint, ownerID uint) ([]entity.PlaylistInfo, error) {
	tx := orm.GetDB(ctx)

	if ownerID == 0 {
		ownerID = currentUserID
	}
	if ownerID != currentUserID && !s.shareService.HasAccess(ctx, currentUserID, ownerID) {
		return nil, ErrShareAccessDenied
	}

	playlists := []entity.PlaylistInfo{}
	err := tx.Model(&entity.Playlist{}).
		Select("playlists.*, COALESCE((SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_id = playlists.id), 0) as song_count").
		Where("playlists.owner_id = ?", ownerID).
		Order("playlists.name ASC").
		Scan(&playlists).Error
	if err != nil {
		return nil, err
	}
	return playlists, nil
}

// CreatePlaylist creates an empty playlist owned by ownerID.
func (s *PlaylistService) CreatePlaylist(ctx context.Context, ownerID uint, name string) (*entity.Playlist, error) {
	tx := orm.GetDB(ctx)

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrPlaylistNameEmpty
	}

	playlist := &entity.Playlist{Name: name, OwnerID: ownerID}
	if err := tx.Create(playlist).Error; err != nil {
		return nil, err
	}
	s.log.Infow("Created playlist", "ownerID", ownerID, "playlistID", playlist.ID)
	return playlist, nil
}

// DeletePlaylist soft-deletes a playlist and hard-deletes its song links.
func (s *PlaylistService) DeletePlaylist(ctx context.Context, ownerID uint, id uint) error {
	tx := orm.GetDB(ctx)

	playlist, err := s.owned(ctx, ownerID, id)
	if err != nil {
		return err
	}
	if err := tx.Where("playlist_id = ?", playlist.ID).Delete(&entity.PlaylistSong{}).Error; err != nil {
		return err
	}
	if err := tx.Delete(playlist).Error; err != nil {
		return err
	}
	s.log.Infow("Deleted playlist", "ownerID", ownerID, "playlistID", id)
	return nil
}

// AddSong appends a song to the playlist. Adding a song that is already there
// is a no-op, so the caller can retry safely.
func (s *PlaylistService) AddSong(ctx context.Context, ownerID uint, playlistID uint, songID uint) error {
	tx := orm.GetDB(ctx)

	playlist, err := s.owned(ctx, ownerID, playlistID)
	if err != nil {
		return err
	}

	var count int64
	if err := tx.Model(&entity.PlaylistSong{}).
		Where("playlist_id = ? AND song_id = ?", playlist.ID, songID).
		Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		s.log.Debugf("Song %d already in playlist %d", songID, playlist.ID)
		return nil
	}

	var maxPosition *int
	if err := tx.Model(&entity.PlaylistSong{}).
		Where("playlist_id = ?", playlist.ID).
		Select("MAX(position)").
		Scan(&maxPosition).Error; err != nil {
		return err
	}
	position := 0
	if maxPosition != nil {
		position = *maxPosition + 1
	}

	return tx.Create(&entity.PlaylistSong{PlaylistID: playlist.ID, SongID: songID, Position: position}).Error
}

// RemoveSong drops a song from the playlist.
func (s *PlaylistService) RemoveSong(ctx context.Context, ownerID uint, playlistID uint, songID uint) error {
	tx := orm.GetDB(ctx)

	playlist, err := s.owned(ctx, ownerID, playlistID)
	if err != nil {
		return err
	}
	return tx.Where("playlist_id = ? AND song_id = ?", playlist.ID, songID).Delete(&entity.PlaylistSong{}).Error
}

// CheckReadAccess authorises a read of the playlist: the caller must own it or
// have been granted access to its owner's collection.
func (s *PlaylistService) CheckReadAccess(ctx context.Context, currentUserID uint, playlistID uint) error {
	tx := orm.GetDB(ctx)

	playlist := entity.Playlist{}
	if err := tx.First(&playlist, playlistID).Error; err != nil {
		// A deleted or unknown playlist is indistinguishable from one we may
		// not see, so report both as denied rather than leaking existence.
		if orm.IsRecordNotFoundError(err) {
			return ErrShareAccessDenied
		}
		return err
	}
	if playlist.OwnerID == currentUserID {
		return nil
	}
	if !s.shareService.HasAccess(ctx, currentUserID, playlist.OwnerID) {
		return ErrShareAccessDenied
	}
	return nil
}

// owned loads a playlist and verifies ownerID owns it.
func (s *PlaylistService) owned(ctx context.Context, ownerID uint, playlistID uint) (*entity.Playlist, error) {
	tx := orm.GetDB(ctx)

	playlist := entity.Playlist{}
	if err := tx.First(&playlist, playlistID).Error; err != nil {
		return nil, err
	}
	if playlist.OwnerID != ownerID {
		return nil, ErrShareAccessDenied
	}
	return &playlist, nil
}
