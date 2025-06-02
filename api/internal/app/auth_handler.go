package app

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
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
	// Create an anonymous access token with random user ID
	now := time.Now().Unix()
	random, err := rand.Int(rand.Reader, big.NewInt(1000))
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to generate random user ID: %w", err))
		return
	}
	token := &auth.AccessToken{
		UserID:      fmt.Sprintf("anonymous-%d-%d", now, random),
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
