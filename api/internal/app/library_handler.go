package app

import (
	"net/http"

	"chords.com/api/internal/dto"
	_ "chords.com/api/internal/entity"
)

// SearchLibrarySongs godoc
//
//	@ID				searchLibrarySongs
//	@Summary		Search public library for songs
//	@Description	Search for songs in the public library using various parameters.
//	@Tags			Library
//	@Accept			json
//	@Produce		json
//	@Param			request	body		dto.SearchSongRequest	true	"Search Song Request"
//	@Success		200		{object}	entity.SongsList		"Search results"
//	@Failure		400		{object}	string					"Bad Request"
//	@Failure		500		{object}	string					"Internal Server Error"
//	@Router			/api/library/songs/search [post]
func (a *App) SearchLibrarySongs(w http.ResponseWriter, r *http.Request) {
	var req dto.SearchSongRequest
	err := parseBody(w, r, &req)
	if err != nil {
		return
	}

	res, err := a.libraryService.SearchSongs(r.Context(), &req)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.logger.Infow("SearchLibrarySongs", "request", req, "found", len(res.Songs))

	a.respondJSON(w, http.StatusOK, res)
}
