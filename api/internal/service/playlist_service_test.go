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

// playlistTestFixture is a database plus two users: an owner and a stranger who
// has not been granted access to anything.
type playlistTestFixture struct {
	db       *gorm.DB
	ctx      context.Context
	svc      *PlaylistService
	owner    *entity.User
	stranger *entity.User
}

func newPlaylistTestFixture(t *testing.T) *playlistTestFixture {
	t.Helper()

	config.InitForTest()
	db, _ := orm.InitForTest()

	f := &playlistTestFixture{
		db:       db,
		ctx:      orm.WithDB(context.Background(), db),
		svc:      NewPlaylistService(),
		owner:    &entity.User{},
		stranger: &entity.User{},
	}
	assert.NoError(t, db.Create(f.owner).Error)
	assert.NoError(t, db.Create(f.stranger).Error)
	return f
}

// createSong creates a song owned by the fixture's owner.
func (f *playlistTestFixture) createSong(t *testing.T, title string) *entity.Song {
	t.Helper()
	song := &entity.Song{Title: title, Sheet: "[C]" + title, Lyrics: title, Format: entity.SheetFormat_Chordpro, OwnerID: f.owner.ID}
	assert.NoError(t, f.db.Create(song).Error)
	return song
}

// share grants the stranger read access to the owner's collection.
func (f *playlistTestFixture) share(t *testing.T) {
	t.Helper()
	link := &entity.ShareLink{Code: "TESTCODE", OwnerID: f.owner.ID}
	assert.NoError(t, f.db.Create(link).Error)
	assert.NoError(t, f.db.Create(&entity.ShareGrant{ShareLinkID: link.ID, GranteeID: f.stranger.ID}).Error)
}

func TestPlaylistService_CreateListDelete(t *testing.T) {
	f := newPlaylistTestFixture(t)

	_, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "   ")
	assert.ErrorIs(t, err, ErrPlaylistNameEmpty)

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "  Gig 12 Sep  ")
	assert.NoError(t, err)
	assert.Equal(t, "Gig 12 Sep", playlist.Name, "name should be trimmed")

	song := f.createSong(t, "Song A")
	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, song.ID))

	playlists, err := f.svc.ListPlaylists(f.ctx, f.owner.ID, 0)
	assert.NoError(t, err)
	assert.Len(t, playlists, 1)
	assert.Equal(t, "Gig 12 Sep", playlists[0].Name)
	assert.Equal(t, int64(1), playlists[0].SongCount)

	assert.NoError(t, f.svc.DeletePlaylist(f.ctx, f.owner.ID, playlist.ID))

	playlists, err = f.svc.ListPlaylists(f.ctx, f.owner.ID, 0)
	assert.NoError(t, err)
	assert.Empty(t, playlists)

	// The join rows are hard-deleted along with the playlist.
	var links int64
	assert.NoError(t, f.db.Model(&entity.PlaylistSong{}).Where("playlist_id = ?", playlist.ID).Count(&links).Error)
	assert.Zero(t, links)
}

func TestPlaylistService_AddAndRemoveSongs(t *testing.T) {
	f := newPlaylistTestFixture(t)

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "Gig")
	assert.NoError(t, err)

	first := f.createSong(t, "Song A")
	second := f.createSong(t, "Song B")

	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, first.ID))
	// Adding the same song again is a no-op, not an error or a duplicate row.
	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, first.ID))
	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, second.ID))

	var rows []entity.PlaylistSong
	assert.NoError(t, f.db.Where("playlist_id = ?", playlist.ID).Order("position ASC").Find(&rows).Error)
	assert.Len(t, rows, 2)
	assert.Equal(t, 0, rows[0].Position)
	assert.Equal(t, first.ID, rows[0].SongID)
	assert.Equal(t, 1, rows[1].Position)
	assert.Equal(t, second.ID, rows[1].SongID)

	assert.NoError(t, f.svc.RemoveSong(f.ctx, f.owner.ID, playlist.ID, first.ID))

	assert.NoError(t, f.db.Where("playlist_id = ?", playlist.ID).Find(&rows).Error)
	assert.Len(t, rows, 1)
	assert.Equal(t, second.ID, rows[0].SongID)
}

func TestPlaylistService_NonOwnerCannotMutate(t *testing.T) {
	f := newPlaylistTestFixture(t)
	// Even a user who was granted read access may not modify the playlist.
	f.share(t)

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "Gig")
	assert.NoError(t, err)
	song := f.createSong(t, "Song A")

	assert.ErrorIs(t, f.svc.AddSong(f.ctx, f.stranger.ID, playlist.ID, song.ID), ErrShareAccessDenied)
	assert.ErrorIs(t, f.svc.RemoveSong(f.ctx, f.stranger.ID, playlist.ID, song.ID), ErrShareAccessDenied)
	assert.ErrorIs(t, f.svc.DeletePlaylist(f.ctx, f.stranger.ID, playlist.ID), ErrShareAccessDenied)
}

func TestPlaylistService_SharedReadAccess(t *testing.T) {
	f := newPlaylistTestFixture(t)

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "Gig")
	assert.NoError(t, err)

	// Without a grant the owner's playlists are invisible.
	_, err = f.svc.ListPlaylists(f.ctx, f.stranger.ID, f.owner.ID)
	assert.ErrorIs(t, err, ErrShareAccessDenied)
	assert.ErrorIs(t, f.svc.CheckReadAccess(f.ctx, f.stranger.ID, playlist.ID), ErrShareAccessDenied)

	f.share(t)

	playlists, err := f.svc.ListPlaylists(f.ctx, f.stranger.ID, f.owner.ID)
	assert.NoError(t, err)
	assert.Len(t, playlists, 1)
	assert.NoError(t, f.svc.CheckReadAccess(f.ctx, f.stranger.ID, playlist.ID))
}

func TestSearchService_SearchSongsByPlaylist(t *testing.T) {
	f := newPlaylistTestFixture(t)

	libraryService := NewLibraryService()
	searchService := NewSearchService()

	ownerCtx := auth.WithAccessToken(f.ctx, &auth.AccessToken{UserID: f.owner.ID})
	library, err := libraryService.EnsureUserLibrary(ownerCtx, f.owner.ID)
	assert.NoError(t, err)

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "Gig")
	assert.NoError(t, err)

	inPlaylist := f.createSong(t, "Song A")
	other := f.createSong(t, "Song B")
	for _, song := range []*entity.Song{inPlaylist, other} {
		assert.NoError(t, libraryService.AddSongToLibrary(ownerCtx, library, song))
	}
	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, inPlaylist.ID))

	req := func() *dto.SearchSongRequest {
		return &dto.SearchSongRequest{
			LibraryType: entity.LibraryType_Private,
			PlaylistID:  playlist.ID,
			Limit:       10,
			ReturnRows:  true,
			ReturnTotal: true,
		}
	}

	result, err := searchService.SearchSongs(ownerCtx, req())
	assert.NoError(t, err)
	assert.Equal(t, int64(1), result.Total)
	assert.Len(t, result.Songs, 1)
	assert.Equal(t, "Song A", result.Songs[0].Title)

	// A stranger without a grant cannot search the owner's playlist.
	strangerCtx := auth.WithAccessToken(f.ctx, &auth.AccessToken{UserID: f.stranger.ID})
	strangerReq := req()
	strangerReq.OwnerID = f.owner.ID
	_, err = searchService.SearchSongs(strangerCtx, strangerReq)
	assert.ErrorIs(t, err, ErrShareAccessDenied)

	// With a grant the same search succeeds, read-only.
	f.share(t)
	strangerReq = req()
	strangerReq.OwnerID = f.owner.ID
	result, err = searchService.SearchSongs(strangerCtx, strangerReq)
	assert.NoError(t, err)
	assert.Len(t, result.Songs, 1)
	assert.Equal(t, "Song A", result.Songs[0].Title)
}

// A playlist holds songs from any library, so filtering by it must not be
// narrowed by the caller's own library: a song added from the public library
// stays visible in the playlist.
func TestSearchService_PlaylistIgnoresLibraryFilter(t *testing.T) {
	f := newPlaylistTestFixture(t)

	libraryService := NewLibraryService()
	searchService := NewSearchService()

	ownerCtx := auth.WithAccessToken(f.ctx, &auth.AccessToken{UserID: f.owner.ID})
	publicLib, err := libraryService.EnsurePublicLibrary(ownerCtx, "Public")
	assert.NoError(t, err)

	// The owner's private library stays empty; the song lives only in public.
	_, err = libraryService.EnsureUserLibrary(ownerCtx, f.owner.ID)
	assert.NoError(t, err)

	publicSong := f.createSong(t, "Public Song")
	assert.NoError(t, libraryService.AddSongToLibrary(ownerCtx, publicLib, publicSong))

	playlist, err := f.svc.CreatePlaylist(f.ctx, f.owner.ID, "Gig")
	assert.NoError(t, err)
	assert.NoError(t, f.svc.AddSong(f.ctx, f.owner.ID, playlist.ID, publicSong.ID))

	// The private library is empty, yet the playlist still shows its song.
	result, err := searchService.SearchSongs(ownerCtx, &dto.SearchSongRequest{
		LibraryType: entity.LibraryType_Private,
		PlaylistID:  playlist.ID,
		Limit:       10,
		ReturnRows:  true,
		ReturnTotal: true,
	})
	assert.NoError(t, err)
	assert.Equal(t, int64(1), result.Total)
	assert.Len(t, result.Songs, 1)
	assert.Equal(t, "Public Song", result.Songs[0].Title)
}
