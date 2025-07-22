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

	file := "file::memory:"

	log := NewGormLogger()

	gormdb, err := gorm.Open(sqlite.Open(file), &gorm.Config{
		Logger: log,
	})
	if err != nil {
		panic(err)
	}
	sqldb, err := gormdb.DB()
	if err != nil {
		panic(err)
	}
	if err := gormdb.AutoMigrate(entities...); err != nil {
		panic(err)
	}
	log.Infof("Migrated entities: %v", len(entities))
	if err := initFTS(gormdb); err != nil {
		panic(err)
	}
	log.Infof("Initialized FTS")

	SetDBInstance(gormdb)

	log.Infof("Connected to Test SQLite in-memory database at %s", file)

	return gormdb, sqldb
}

func CreateOrPanicInTest(value interface{}) {
	if err := gormInstance.Create(value).Error; err != nil {
		panic(err)
	}
}
