package orm

import (
	"net/http"

	"chords.com/api/internal/logger"
)

var log logger.Logger

/* Adds logger with request id label to context */
func Middleware(next http.Handler) http.Handler {
	if log == nil {
		log = logger.NewLogger("orm")
	}

	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := SetDB(r.Context(), GetDBInstance())

		next.ServeHTTP(w, r.WithContext(ctx))
	})

	return f
}
