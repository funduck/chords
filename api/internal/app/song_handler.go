package app

import (
	"net/http"

	_ "chords.com/api/internal/entity"
)

// GetSongByID godoc
//
//	@ID				getSongByID
//	@Summary		Get song by ID
//	@Description	Retrieve a song by its ID
//	@Tags			Songs
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Song ID"
//	@Success		200	{object}	entity.Song
//	@Router			/api/songs/{id} [get]
func (a *App) GetSongByID(w http.ResponseWriter, r *http.Request) {
	songID, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	song, err := a.songService.GetSongByID(r.Context(), songID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, song)
}
