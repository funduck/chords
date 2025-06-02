package orm

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"chords.com/api/internal/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitForTest() (*gorm.DB, *sql.DB) {
	// file := "test.sqlite"
	// if _, err := os.Stat(file); err == nil {
	// 	if err := os.Remove(file); err != nil {
	// 		panic(fmt.Errorf("failed to remove existing test database file: %w", err))
	// 	}
	// }

	file := "file::memory:?cache=shared"

	gormdb, err := gorm.Open(sqlite.Open(file), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
			logger.Config{
				SlowThreshold:             time.Second,
				LogLevel:                  logger.Info,
				IgnoreRecordNotFoundError: true,
				ParameterizedQueries:      false, // Don't include params in the SQL log
				Colorful:                  true,
			}),
	},
	)
	if err != nil {
		panic(err)
	}
	db, err := gormdb.DB()
	if err != nil {
		panic(err)
	}
	if err := gormdb.AutoMigrate(entity.Room{}); err != nil {
		panic(err)
	}

	SetDBInstance(gormdb)

	fmt.Println("Connected to SQLite in-memory database")

	return gormdb, db
}

func CreateOrPanicInTest(value interface{}) {
	if err := gormInstance.Create(value).Error; err != nil {
		panic(err)
	}
}
