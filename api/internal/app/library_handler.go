package app

import (
	"net/http"

	"chords.com/api/internal/entity"
)

// SearchPublicLibrary godoc
// @ID searchPublicLibrary
// @Summary      Search public library for songs
// @Description  Search for songs in the public library using various parameters.
// @Tags         library
// @Accept       json
// @Produce      json
// @Param        request body entity.SearchSongRequest true "Search Song Request"
// @Success      200 {object} entity.SearchSongResponse "Search results"
// @Failure      400 {object} string "Bad Request"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/library/public [post]
func (a *App) SearchPublicLibrary(w http.ResponseWriter, r *http.Request) {
	var req entity.SearchSongRequest
	err := parseBody(w, r, &req)
	if err != nil {
		return
	}

	res, err := a.publicLibraryService.SearchSongs(r.Context(), &req)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, res)
}
