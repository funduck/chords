package orm

import (
	"net/http"
)

/* Adds logger with request id label to context */
func Middleware(next http.Handler) http.Handler {

	f := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := SetDB(r.Context(), GetDBInstance())

		next.ServeHTTP(w, r.WithContext(ctx))
	})

	return f
}
