package orm

import (
	"context"
	"database/sql"
	"fmt"

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
		log.Errorf("Failed to initialize FTS: %v", err)
	} else {
		log.Infoln("Initialized FTS tables")
	}

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
	if err == gorm.ErrRecordNotFound {
		return true
	}
	return false
}

// initFTS creates FTS virtual tables and triggers
func initFTS(db *gorm.DB) error {
	// Example FTS table for songs/chords - adjust table name and columns as needed
	ftsQueries := []string{
		// `DROP TABLE IF EXISTS songs_fts`,
		// `DROP TRIGGER IF EXISTS songs_ai`,
		// `DROP TRIGGER IF EXISTS songs_au`,
		// `DROP TRIGGER IF EXISTS songs_ad`,

		// Create FTS5 virtual table
		`CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
			title, artist, composer, sheet, content='songs', content_rowid='id'
		)`,

		// Trigger to keep FTS table in sync when inserting
		`CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
			INSERT INTO songs_fts(rowid, title, artist, composer, sheet) 
			VALUES (new.id, new.title, new.artist, new.composer, new.sheet);
		END`,

		// Trigger to keep FTS table in sync when updating
		`CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
			INSERT INTO songs_fts(songs_fts, rowid, title, artist, composer, sheet) 
			VALUES('delete', old.id, old.title, old.artist, old.composer, old.sheet);
			INSERT INTO songs_fts(rowid, title, artist, composer, sheet) 
			VALUES (new.id, new.title, new.artist, new.composer, new.sheet);
		END`,

		// Trigger to keep FTS table in sync when deleting
		`CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
			INSERT INTO songs_fts(songs_fts, rowid, title, artist, composer, sheet) 
			VALUES('delete', old.id, old.title, old.artist, old.composer, old.sheet);
		END`,
	}

	for _, query := range ftsQueries {
		if err := db.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to execute FTS query: %w", err)
		}
	}

	return nil
}

// SearchFTS performs full-text search on the specified table
func SearchFTS(tx *gorm.DB, table string, query string) *gorm.DB {
	ftsTable := fmt.Sprintf("%s_fts", table)
	return tx.Joins(fmt.Sprintf("JOIN %s ON %s.rowid = %s.id", ftsTable, ftsTable, table)).
		Where(fmt.Sprintf("%s MATCH ?", ftsTable), query)
}

// RebuildFTS rebuilds the FTS index for a specific table
func RebuildFTS(ctx context.Context, table string) error {
	db := GetDB(ctx)
	ftsTable := fmt.Sprintf("%s_fts", table)
	return db.Exec(fmt.Sprintf("INSERT INTO %s(%s) VALUES('rebuild')", ftsTable, ftsTable)).Error
}
