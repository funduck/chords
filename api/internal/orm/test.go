package orm

import (
	"database/sql"
	"fmt"

	"chords.com/api/internal/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitForTest() (*gorm.DB, *sql.DB) {
	gormdb, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
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
