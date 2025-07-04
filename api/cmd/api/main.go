package main

import (
	"net/http"

	"chords.com/api/internal/app"
	"chords.com/api/internal/config"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

// @title			Chords API
// @version		1.0
// @description	This is a Chords server.
func main() {
	log := logger.New()
	c := config.New()
	orm.InitSQLite()
	a := app.NewApp()
	r := app.NewHttpRouter(a)

	log.Infof("HTTP server is starting on port %s", c.Port)

	if err := http.ListenAndServe(":"+c.Port, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}

}
