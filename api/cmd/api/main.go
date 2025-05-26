package main

import (
	"net/http"

	"chords.com/api/internal/app"
	"chords.com/api/internal/config"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

func main() {
	log := logger.New()
	c := config.New()
	gormdb, _ := orm.InitSQLite()
	a := app.New(gormdb)
	r := app.NewRouter(a)

	log.Infof("Server is starting on port %s", c.Port)
	if err := http.ListenAndServe(":"+c.Port, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
