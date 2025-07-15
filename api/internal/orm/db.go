package orm

import (
	"context"
	"database/sql"
	"errors"

	"chords.com/api/internal/config"
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
func SetDBInstance(db *gorm.DB) {
	gormInstance = db
}

func GetDBInstance() *gorm.DB {
	if gormInstance == nil {
		InitSQLite()
	}

	return gormInstance
}

//	func SetSQLDb(ctx context.Context, db *sql.DB) context.Context {
//		return context.WithValue(ctx, sqldbKey, db)
//	}
func SetDB(ctx context.Context, db *gorm.DB) context.Context {
	return context.WithValue(ctx, gormdbKey, db)
}

//	func GetSQLDb(ctx context.Context) *sql.DB {
//		if dto := ctx.Value(sqldbKey); dto != nil {
//			return dto.(*sql.DB)
//		}
//		return sqlInstance
//	}
func GetDB(ctx context.Context) *gorm.DB {
	if dto := ctx.Value(gormdbKey); dto != nil {
		return dto.(*gorm.DB)
	}
	return gormInstance
}

func InitSQLite() (*gorm.DB, *sql.DB) {
	file := config.New().SQLiteFile
	log := NewGormLogger()
	gormdb, err := gorm.Open(sqlite.Open(file), &gorm.Config{
		Logger: log,
	})
	if err != nil {
		panic(err)
	}
	SetDBInstance(gormdb)

	db, err := gormdb.DB()
	if err != nil {
		panic(err)
	}

	log.Infof("Connected to SQLite database %s", file)

	if err := gormdb.AutoMigrate(entities...); err != nil {
		panic(err)
	}
	log.Infoln("Auto-migrated entities")
	if err := initFTS(gormdb); err != nil {
		panic(err)
	}
	log.Infoln("Initialized FTS for entities")

	return gormdb, db
}

func Close() {
	if gormInstance != nil {
		log := logger.NewForModule("db")
		sqlDB, err := gormInstance.DB()
		if err != nil {
			log.Error("Failed to get SQL DB from GORM instance: ", err)
			return
		}
		if err := sqlDB.Close(); err != nil {
			log.Error("Failed to close SQL DB: ", err)
		} else {
			log.Info("Closed database connection")
		}
	}
}

func IsRecordNotFoundError(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, gorm.ErrRecordNotFound) || err == gorm.ErrRecordNotFound {
		return true
	}
	return false
}
