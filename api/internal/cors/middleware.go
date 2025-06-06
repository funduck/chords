package cors

import (
	"net/http"

	"chords.com/api/internal/logger"
)

var log logger.Logger

func Middleware(next http.Handler) http.Handler {
	if log == nil {
		log = logger.NewLogger("auth")
	}

	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})

	return f
}
