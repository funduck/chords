package orm

import (
	"context"
	"database/sql"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// type sqldbKeyType string
type gormdbKeyType string

// const sqldbKey sqldbKeyType = "sqldb"
const gormdbKey gormdbKeyType = "gormdb"

// var sqlInstance *sql.DB
var gormInstance *gorm.DB

//	func SetSQLInstance(db *sql.DB) {
//		sqlInstance = db
//	}
func SetGORMInstance(db *gorm.DB) {
	gormInstance = db
}

//	func SetSQLDb(ctx context.Context, db *sql.DB) context.Context {
//		return context.WithValue(ctx, sqldbKey, db)
//	}
func SetGORMDb(ctx context.Context, db *gorm.DB) context.Context {
	return context.WithValue(ctx, gormdbKey, db)
}

//	func GetSQLDb(ctx context.Context) *sql.DB {
//		if dto := ctx.Value(sqldbKey); dto != nil {
//			return dto.(*sql.DB)
//		}
//		return sqlInstance
//	}
func GetGORMDb(ctx context.Context) *gorm.DB {
	if dto := ctx.Value(gormdbKey); dto != nil {
		return dto.(*gorm.DB)
	}
	return gormInstance
}

func InitSQLite() (*gorm.DB, *sql.DB) {
	file := config.New().SQLiteFile
	gormdb, err := gorm.Open(sqlite.Open(file), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	SetGORMInstance(gormdb)

	db, err := gormdb.DB()
	if err != nil {
		panic(err)
	}

	log := logger.NewForModule("db")
	log.Info("Connected to SQLite database ", file)

	if err := gormdb.AutoMigrate(entity.Room{}); err != nil {
		panic(err)
	}
	log.Info("Auto-migrated entities")

	return gormdb, db
}
