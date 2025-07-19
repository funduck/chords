package app

import (
	"net/http"

	"chords.com/api/internal/dto"
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

// CreateSong godoc
//
//	@ID				createSong
//	@Summary		Create a new song
//	@Description	Create a new song with the provided details
//	@Tags			Songs
//	@Accept			json
//	@Produce		json
//	@Param			song	body		dto.CreateSongRequest	true	"Song details"
//	@Success		201		{object}	entity.Song
//	@Router			/api/songs [put]
func (a *App) CreateSong(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateSongRequest
	err := parseBody(w, r, &req)
	if err != nil {
		return
	}

	song, err := a.createSongUseCase.Execute(r.Context(), &req)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}
	a.respondJSON(w, http.StatusCreated, song)
}

// UpdateSong godoc
//
//	@ID				updateSong
//	@Summary		Update an existing song
//	@Description	Update the details of an existing song
//	@Tags			Songs
//	@Accept			json
//	@Produce		json
//	@Param			id		path		int						true	"Song ID"
//	@Param			song	body		dto.UpdateSongRequest	true	"Updated song details"
//	@Success		200		{object}	entity.Song
//	@Router			/api/songs/{id} [patch]
func (a *App) UpdateSong(w http.ResponseWriter, r *http.Request) {
	songID, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	var req dto.UpdateSongRequest
	err = parseBody(w, r, &req)
	if err != nil {
		return
	}

	_, err = a.songService.UpdateSong(r.Context(), songID, &req)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	// Retrieve the updated song with all details
	song, err := a.songService.GetSongByID(r.Context(), songID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, song)
}
