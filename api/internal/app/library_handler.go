package app

import (
	"net/http"

	"chords.com/api/internal/dto"
)

// SearchPublicLibrary godoc
// @ID searchPublicLibrary
// @Summary      Search public library for songs
// @Description  Search for songs in the public library using various parameters.
// @Tags         library
// @Accept       json
// @Produce      json
// @Param        request body dto.SearchSongRequest true "Search Song Request"
// @Success      200 {object} dto.SearchSongResponse "Search results"
// @Failure      400 {object} string "Bad Request"
// @Failure      500 {object} string "Internal Server Error"
// @Router       /api/library/public [post]
func (a *App) SearchPublicLibrary(w http.ResponseWriter, r *http.Request) {
	var req dto.SearchSongRequest
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
