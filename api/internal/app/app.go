package app

import (
	"chords.com/api/internal/logger"
	"gorm.io/gorm"
)

type App struct {
	gormdb *gorm.DB
	logger logger.Logger
}

func New(gormdb *gorm.DB) *App {
	return &App{
		gormdb: gormdb,
		logger: logger.NewLogger("app"),
	}
}
