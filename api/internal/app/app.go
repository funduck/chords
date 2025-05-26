package app

import (
	"net/http"

	"gorm.io/gorm"
)

type App struct {
	gormdb *gorm.DB
}

func New(gormdb *gorm.DB) *App {
	return &App{
		gormdb: gormdb,
	}
}

func RespondText(w http.ResponseWriter, r *http.Request, result string) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}
