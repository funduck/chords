package app

import (
	"net/http"
)

func (a *App) GetSong(w http.ResponseWriter, r *http.Request) {
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
