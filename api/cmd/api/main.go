package main

import (
	"net/http"

	"chords.com/api/internal/app"
	"chords.com/api/internal/config"
	"chords.com/api/internal/logger"
)

func main() {
	log := logger.New()
	a := app.New()
	r := app.NewRouter(a)
	c := config.New()

	log.Infof("Server is starting on port %s", c.Port)
	if err := http.ListenAndServe(":"+c.Port, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
