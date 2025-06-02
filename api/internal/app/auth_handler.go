package app

import (
	"fmt"
	"net/http"

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
	user := entity.User{}
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

	a.respondJSON(w, http.StatusOK, map[string]string{
		"access_token": tokenString,
		// TODO refresh_token: "",
	})
}
