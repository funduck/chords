package app

import (
	"net/http"

	"chords.com/api/internal/dto"
	_ "chords.com/api/internal/entity"
)

// SearchArtists godoc
//
//	@ID				searchArtists
//	@Summary		Search for artists
//	@Description	Search for artists using various parameters with pagination support.
//	@Tags			Artists
//	@Accept			json
//	@Produce		json
//	@Param			request	body		dto.SearchArtistRequest	true	"Search Artist Request"
//	@Success		200		{object}	entity.ArtistsList		"Search results"
//	@Failure		400		{object}	string					"Bad Request"
//	@Failure		500		{object}	string					"Internal Server Error"
//	@Router			/api/artists/search [post]
func (a *App) SearchArtists(w http.ResponseWriter, r *http.Request) {
	var req dto.SearchArtistRequest
	err := parseBody(w, r, &req)
	if err != nil {
		return
	}

	res, err := a.artistService.SearchArtists(r.Context(), &req)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.logger.Infow("SearchArtists", "request", req, "found", len(res.Artists))

	a.respondJSON(w, http.StatusOK, res)
}

// GetArtistByID godoc
//
//	@ID				getArtistByID
//	@Summary		Get artist by ID
//	@Description	Retrieve an artist by its ID
//	@Tags			Artists
//	@Accept			json
//	@Produce		json
//	@Param			id	path		int	true	"Artist ID"
//	@Success		200	{object}	entity.Artist
//	@Router			/api/artists/{id} [get]
func (a *App) GetArtistByID(w http.ResponseWriter, r *http.Request) {
	artistID, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	artist, err := a.artistService.GetArtistByID(r.Context(), artistID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, artist)
}
