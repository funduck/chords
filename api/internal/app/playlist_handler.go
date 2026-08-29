package app

import (
	"errors"
	"net/http"
	"strconv"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"chords.com/api/internal/service"
)

// respondPlaylistError maps playlist service errors onto HTTP statuses.
func (a *App) respondPlaylistError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, service.ErrShareAccessDenied):
		a.respondError(w, http.StatusForbidden, err)
	case errors.Is(err, service.ErrPlaylistNameEmpty):
		a.respondError(w, http.StatusBadRequest, err)
	case orm.IsRecordNotFoundError(err):
		a.respondError(w, http.StatusNotFound, err)
	default:
		a.respondError(w, http.StatusInternalServerError, err)
	}
}

// ListPlaylists godoc
//
//	@ID				listPlaylists
//	@Summary		List playlists
//	@Description	List the playlists of the given owner, defaulting to the current user.
//	@Tags			Playlists
//	@Produce		json
//	@Param			owner_id	query	integer	false	"Owner ID"
//	@Security		BearerAuth
//	@Success		200	{array}		entity.PlaylistInfo	"Playlists"
//	@Failure		401	{object}	string				"Unauthorized"
//	@Failure		403	{object}	string				"Forbidden"
//	@Failure		500	{object}	string				"Internal Server Error"
//	@Router			/api/playlists [get]
func (a *App) ListPlaylists(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	var ownerID uint
	if raw := r.URL.Query().Get("owner_id"); raw != "" {
		parsed, err := strconv.ParseUint(raw, 10, 32)
		if err != nil {
			a.respondError(w, http.StatusBadRequest, err)
			return
		}
		ownerID = uint(parsed)
	}

	var playlists []entity.PlaylistInfo
	playlists, err = a.playlistService.ListPlaylists(r.Context(), accessToken.UserID, ownerID)
	if err != nil {
		a.respondPlaylistError(w, err)
		return
	}

	a.respondJSON(w, http.StatusOK, playlists)
}

// CreatePlaylist godoc
//
//	@ID				createPlaylist
//	@Summary		Create a playlist
//	@Description	Create an empty playlist owned by the current user.
//	@Tags			Playlists
//	@Accept			json
//	@Produce		json
//	@Param			request	body	dto.CreatePlaylistRequest	true	"Playlist"
//	@Security		BearerAuth
//	@Success		201	{object}	entity.Playlist	"Playlist created"
//	@Failure		400	{object}	string			"Bad Request"
//	@Failure		401	{object}	string			"Unauthorized"
//	@Failure		500	{object}	string			"Internal Server Error"
//	@Router			/api/playlists [post]
func (a *App) CreatePlaylist(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	req := dto.CreatePlaylistRequest{}
	if err := parseBody(w, r, &req); err != nil {
		return
	}

	playlist, err := a.playlistService.CreatePlaylist(r.Context(), accessToken.UserID, req.Name)
	if err != nil {
		a.respondPlaylistError(w, err)
		return
	}

	a.respondJSON(w, http.StatusCreated, playlist)
}

// DeletePlaylist godoc
//
//	@ID				deletePlaylist
//	@Summary		Delete a playlist
//	@Description	Delete a playlist owned by the current user.
//	@Tags			Playlists
//	@Param			id	path	integer	true	"Playlist ID"
//	@Security		BearerAuth
//	@Success		204	"Playlist deleted"
//	@Failure		400	{object}	string	"Bad Request"
//	@Failure		401	{object}	string	"Unauthorized"
//	@Failure		403	{object}	string	"Forbidden"
//	@Failure		404	{object}	string	"Not Found"
//	@Failure		500	{object}	string	"Internal Server Error"
//	@Router			/api/playlists/{id} [delete]
func (a *App) DeletePlaylist(w http.ResponseWriter, r *http.Request) {
	id, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	if err := a.playlistService.DeletePlaylist(r.Context(), accessToken.UserID, id); err != nil {
		a.respondPlaylistError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// AddSongToPlaylist godoc
//
//	@ID				addSongToPlaylist
//	@Summary		Add a song to a playlist
//	@Description	Append a song to a playlist owned by the current user. Adding a song twice is a no-op.
//	@Tags			Playlists
//	@Param			id		path	integer	true	"Playlist ID"
//	@Param			songId	path	integer	true	"Song ID"
//	@Security		BearerAuth
//	@Success		204	"Song added"
//	@Failure		400	{object}	string	"Bad Request"
//	@Failure		401	{object}	string	"Unauthorized"
//	@Failure		403	{object}	string	"Forbidden"
//	@Failure		404	{object}	string	"Not Found"
//	@Failure		500	{object}	string	"Internal Server Error"
//	@Router			/api/playlists/{id}/songs/{songId} [post]
func (a *App) AddSongToPlaylist(w http.ResponseWriter, r *http.Request) {
	id, songID, accessToken, ok := a.parsePlaylistSongParams(w, r)
	if !ok {
		return
	}

	if err := a.playlistService.AddSong(r.Context(), accessToken.UserID, id, songID); err != nil {
		a.respondPlaylistError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RemoveSongFromPlaylist godoc
//
//	@ID				removeSongFromPlaylist
//	@Summary		Remove a song from a playlist
//	@Description	Remove a song from a playlist owned by the current user.
//	@Tags			Playlists
//	@Param			id		path	integer	true	"Playlist ID"
//	@Param			songId	path	integer	true	"Song ID"
//	@Security		BearerAuth
//	@Success		204	"Song removed"
//	@Failure		400	{object}	string	"Bad Request"
//	@Failure		401	{object}	string	"Unauthorized"
//	@Failure		403	{object}	string	"Forbidden"
//	@Failure		404	{object}	string	"Not Found"
//	@Failure		500	{object}	string	"Internal Server Error"
//	@Router			/api/playlists/{id}/songs/{songId} [delete]
func (a *App) RemoveSongFromPlaylist(w http.ResponseWriter, r *http.Request) {
	id, songID, accessToken, ok := a.parsePlaylistSongParams(w, r)
	if !ok {
		return
	}

	if err := a.playlistService.RemoveSong(r.Context(), accessToken.UserID, id, songID); err != nil {
		a.respondPlaylistError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (a *App) parsePlaylistSongParams(w http.ResponseWriter, r *http.Request) (uint, uint, *auth.AccessToken, bool) {
	id, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return 0, 0, nil, false
	}
	songID, err := parseURLParamUint(w, r, "songId")
	if err != nil {
		return 0, 0, nil, false
	}
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return 0, 0, nil, false
	}
	return id, songID, accessToken, true
}
