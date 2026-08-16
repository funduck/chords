package app

import (
	"net/http"

	"chords.com/api/internal/dto"
	"github.com/go-chi/chi/v5"
)

// CreateShareLink godoc
//
//	@ID				createShareLink
//	@Summary		Create a share link
//	@Description	Create a revocable link that grants read-only access to the current user's collection.
//	@Tags			Shares
//	@Produce		json
//	@Security		BearerAuth
//	@Success		201	{object}	dto.CreateShareLinkResponse	"Share link created"
//	@Failure		401	{object}	string						"Unauthorized"
//	@Failure		500	{object}	string						"Internal Server Error"
//	@Router			/api/shares [post]
func (a *App) CreateShareLink(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	link, err := a.shareService.CreateShareLink(r.Context(), accessToken.UserID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusCreated, dto.CreateShareLinkResponse{Code: link.Code})
}

// ListShareLinks godoc
//
//	@ID				listShareLinks
//	@Summary		List share links
//	@Description	List the current user's active share links.
//	@Tags			Shares
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		dto.ShareLinkInfo	"Share links"
//	@Failure		401	{object}	string				"Unauthorized"
//	@Failure		500	{object}	string				"Internal Server Error"
//	@Router			/api/shares [get]
func (a *App) ListShareLinks(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	links, err := a.shareService.ListShareLinks(r.Context(), accessToken.UserID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, links)
}

// RevokeShareLink godoc
//
//	@ID				revokeShareLink
//	@Summary		Revoke a share link
//	@Description	Revoke a share link, cutting access for everyone who redeemed it.
//	@Tags			Shares
//	@Param			id	path	integer	true	"Share Link ID"
//	@Security		BearerAuth
//	@Success		204	"Share link revoked"
//	@Failure		400	{object}	string	"Bad Request"
//	@Failure		401	{object}	string	"Unauthorized"
//	@Failure		500	{object}	string	"Internal Server Error"
//	@Router			/api/shares/{id} [delete]
func (a *App) RevokeShareLink(w http.ResponseWriter, r *http.Request) {
	id, err := parseURLParamUint(w, r, "id")
	if err != nil {
		return
	}

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	if err := a.shareService.RevokeShareLink(r.Context(), accessToken.UserID, id); err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// RedeemShare godoc
//
//	@ID				redeemShare
//	@Summary		Redeem a share link
//	@Description	Redeem a share code to gain read-only access to a collection.
//	@Tags			Shares
//	@Produce		json
//	@Param			code	path	string	true	"Share Code"
//	@Security		BearerAuth
//	@Success		200	{object}	dto.RedeemResponse	"Share redeemed"
//	@Failure		400	{object}	string				"Bad Request"
//	@Failure		401	{object}	string				"Unauthorized"
//	@Failure		500	{object}	string				"Internal Server Error"
//	@Router			/api/shares/redeem/{code} [post]
func (a *App) RedeemShare(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	res, err := a.shareService.Redeem(r.Context(), accessToken.UserID, code)
	if err != nil {
		a.respondError(w, http.StatusBadRequest, err)
		return
	}

	a.respondJSON(w, http.StatusOK, res)
}

// ListSharedCollections godoc
//
//	@ID				listSharedCollections
//	@Summary		List shared collections
//	@Description	List collections the current user can browse via redeemed links.
//	@Tags			Shares
//	@Produce		json
//	@Security		BearerAuth
//	@Success		200	{array}		dto.SharedCollection	"Shared collections"
//	@Failure		401	{object}	string					"Unauthorized"
//	@Failure		500	{object}	string					"Internal Server Error"
//	@Router			/api/shares/collections [get]
func (a *App) ListSharedCollections(w http.ResponseWriter, r *http.Request) {
	accessToken, err := getAccessToken(w, r)
	if err != nil {
		return
	}

	collections, err := a.shareService.ListCollections(r.Context(), accessToken.UserID)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}

	a.respondJSON(w, http.StatusOK, collections)
}
