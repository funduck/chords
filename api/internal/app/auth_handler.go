package app

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"` // Optional, can be empty
}

// AnonymousLogIn godoc
// @Summary      Anonymous Log In
// @Description  Create an anonymous access token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200  {object}  LoginResponse
// @Router	     /api/auth/anonymous [post]
func (a *App) AnonymousLogIn(w http.ResponseWriter, r *http.Request) {
	tx := orm.GetDB(r.Context())
	user := entity.User{
		IsAnonymous: true,
	}
	if err := tx.Create(&user).Error; err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to create anonymous user: %w", err))
		return
	}

	token := &auth.AccessToken{
		UserID:      user.ID,
		IsAnonymous: true,
	}

	conf := config.New()
	tokenString, err := token.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to encode access token: %w", err))
		return
	}

	response := LoginResponse{
		AccessToken:  tokenString,
		RefreshToken: fmt.Sprintf("refresh_token_for_user_%d", user.ID), // Placeholder for refresh token
	}
	a.respondJSON(w, http.StatusOK, response)
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshToken godoc
// @Summary      Refresh Access Token
// @Description  Refresh an access token using a refresh token
// @Tags         auth
// @Produce      json
// @Param        data  body      RefreshTokenRequest true "Refresh Token Request"
// @Success      200  {object}  LoginResponse
// @Router	     /api/auth/refresh-token [post]
func (a *App) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	if err := parseBody(w, r, &req); err != nil {
		return
	}

	userIDstr := strings.TrimPrefix(req.RefreshToken, "refresh_token_for_user_")
	if userIDstr == "" {
		a.respondError(w, http.StatusBadRequest, fmt.Errorf("invalid refresh token format"))
		return
	}
	userID, err := strconv.ParseUint(userIDstr, 10, 64)
	if err != nil {
		a.respondError(w, http.StatusBadRequest, fmt.Errorf("invalid user ID in refresh token: %w", err))
		return
	}

	tx := orm.GetDB(r.Context())
	user := entity.User{}
	if err := tx.First(&user, userID).Error; err != nil {
		a.respondError(w, http.StatusNotFound, fmt.Errorf("user not found: %w", err))
		return
	}

	token := &auth.AccessToken{
		UserID:      user.ID,
		IsAnonymous: user.IsAnonymous,
	}

	conf := config.New()
	tokenString, err := token.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to encode access token: %w", err))
		return
	}

	response := LoginResponse{
		AccessToken:  tokenString,
		RefreshToken: req.RefreshToken, // Echo back the refresh token
	}
	a.respondJSON(w, http.StatusOK, response)
}
