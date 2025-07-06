package app

import (
	"fmt"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger/v2"

	_ "chords.com/api/docs" // Import the generated Swagger docs
	"chords.com/api/internal/auth"
	"chords.com/api/internal/cors"
	"chords.com/api/internal/orm"
)

func NewHttpRouter(a *App) *chi.Mux {
	r := chi.NewRouter()

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Get("/swagger/*", func(w http.ResponseWriter, r *http.Request) {
		protocol := "http"
		if r.TLS != nil {
			protocol = "https"
		}

		httpSwagger.Handler(
			httpSwagger.URL(protocol+"://"+r.Host+"/swagger/doc.json"),
		).ServeHTTP(w, r)
	})

	r.Post("/log", func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusInternalServerError)
			return
		}
		fmt.Printf("Received log message: %s\n", body)

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	r.Group(func(r chi.Router) {
		r.Use(middleware.RequestID)
		r.Use(middleware.RealIP)
		r.Use(middleware.Logger)
		r.Use(middleware.Recoverer)

		r.Route("/api", func(r chi.Router) {
			r.Use(cors.Middleware)
			r.Use(orm.Middleware)

			r.Handle("/ws", a.NewWSHandler())
			r.Post("/ws", a.PostWSHandler)

			r.Post("/auth/anonymous", a.AnonymousLogIn)
			r.Post("/auth/refresh-token", a.RefreshToken)

			r.Group(func(r chi.Router) {
				r.Use(auth.Middleware)

				r.Post("/rooms", a.CreateRoom)
				r.Post("/rooms/join", a.JoinRoom)
				r.Patch("/rooms/{id}", a.UpdateRoom)
				r.Post("/rooms/{id}/leave", a.LeaveRoom)

				r.Post("/artists/search", a.SearchArtists)

				r.Post("/songs/search", a.SearchSongs)
				r.Get("/songs/{id}", a.GetSongByID)
			})
		})
	})

	return r
}
