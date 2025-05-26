package orm

import (
	"database/sql"
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitSQLiteForTest() (*gorm.DB, *sql.DB) {
	gormdb, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	db, err := gormdb.DB()
	if err != nil {
		panic(err)
	}
	// if err := gormdb.AutoMigrate(entity.User{}, entity.Token{}, entity.UserSocial{}, entity.Social{}); err != nil {
	// 	panic(err)
	// }

	SetGORMInstance(gormdb)

	fmt.Println("Connected to SQLite in-memory database")

	return gormdb, db
}

func CreateOrPanicInTest(value interface{}) {
	if err := gormInstance.Create(value).Error; err != nil {
		panic(err)
	}
}
