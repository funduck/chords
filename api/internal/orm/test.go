package orm

import (
	"database/sql"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitForTest() (*gorm.DB, *sql.DB) {
	// file := "test.sqlite"
	// if _, err := os.Stat(file); err == nil {
	// 	if err := os.Remove(file); err != nil {
	// 		panic(fmt.Errorf("failed to remove existing test database file: %w", err))
	// 	}
	// }

	file := "file::memory:?cache=shared"

	log := NewGormLogger()

	gormdb, err := gorm.Open(sqlite.Open(file), &gorm.Config{
		Logger: log,
	},
	)
	if err != nil {
		panic(err)
	}
	db, err := gormdb.DB()
	if err != nil {
		panic(err)
	}
	if err := gormdb.AutoMigrate(entities...); err != nil {
		panic(err)
	}
	if err := initFTS(gormdb); err != nil {
		panic(err)
	}

	SetDBInstance(gormdb)

	log.Infof("Connected to SQLite in-memory database at %s", file)

	return gormdb, db
}

func CreateOrPanicInTest(value interface{}) {
	if err := gormInstance.Create(value).Error; err != nil {
		panic(err)
	}
}
