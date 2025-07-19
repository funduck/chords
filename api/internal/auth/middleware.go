package auth

import (
	"fmt"
	"net/http"
	"strings"

	"chords.com/api/internal/config"
	"chords.com/api/internal/logger"
)

var log logger.Logger

func Middleware(next http.Handler) http.Handler {
	if log == nil {
		log = logger.NewLogger("auth")
	}

	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorization := r.Header.Get("authorization")

		if authorization == "" {
			msg := "Missing authorization header"
			log.Error(msg)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(msg))
			return
		}

		// Extract JTW token from the header
		parts := strings.Split(authorization, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			msg := "Invalid token header format, expected 'Bearer <token>'"
			log.Error(msg)
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(msg))
			return
		}

		accessToken, err := ParseAccessToken(w, parts[1])
		if err != nil {
			// Error message already logged in ParseAccessToken
			return
		}

		ctx := WithAccessToken(r.Context(), accessToken)

		next.ServeHTTP(w, r.WithContext(ctx))
	})

	return f
}

func ParseAccessToken(w http.ResponseWriter, accessTokenStr string) (*AccessToken, error) {
	accessToken := AccessToken{}
	conf := config.New()
	err := accessToken.Decode(accessTokenStr, conf.Secret)
	if err != nil {
		msg := fmt.Sprintf("Failed to decode access token: %v", err)
		log.Error(msg)
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(msg))
		return nil, err
	}

	return &accessToken, nil
}
