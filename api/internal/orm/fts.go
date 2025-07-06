package orm

import (
	"context"
	"fmt"

	"gorm.io/gorm"
)

// initFTS creates FTS virtual tables and triggers
func initFTS(db *gorm.DB) error {
	if err := initSongsFTS(db); err != nil {
		return fmt.Errorf("failed to initialize songs FTS: %w", err)
	}

	if err := initArtistsFTS(db); err != nil {
		return fmt.Errorf("failed to initialize artists FTS: %w", err)
	}

	return nil
}

// initSongsFTS creates FTS virtual table and triggers for songs
func initSongsFTS(db *gorm.DB) error {
	ftsQueries := []string{
		// `DROP TABLE IF EXISTS songs_fts`,
		// `DROP TRIGGER IF EXISTS songs_ai`,
		// `DROP TRIGGER IF EXISTS songs_au`,
		// `DROP TRIGGER IF EXISTS songs_ad`,

		// Create FTS5 virtual table for songs
		`CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
			title, sheet, content='songs', content_rowid='id'
		)`,

		// Trigger to keep songs FTS table in sync when inserting
		`CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
			INSERT INTO songs_fts(rowid, title, sheet) 
			VALUES (new.id, new.title, new.sheet);
		END`,

		// Trigger to keep songs FTS table in sync when updating
		`CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
			INSERT INTO songs_fts(songs_fts, rowid, title, sheet) 
			VALUES('delete', old.id, old.title, old.sheet);
			INSERT INTO songs_fts(rowid, title, sheet) 
			VALUES (new.id, new.title, new.sheet);
		END`,

		// Trigger to keep songs FTS table in sync when deleting
		`CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
			INSERT INTO songs_fts(songs_fts, rowid, title, sheet) 
			VALUES('delete', old.id, old.title, old.sheet);
		END`,
	}

	for _, query := range ftsQueries {
		if err := db.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to execute songs FTS query: %w", err)
		}
	}

	return nil
}

// initArtistsFTS creates FTS virtual table and triggers for artists
func initArtistsFTS(db *gorm.DB) error {
	ftsQueries := []string{
		// `DROP TABLE IF EXISTS artists_fts`,
		// `DROP TRIGGER IF EXISTS artists_ai`,
		// `DROP TRIGGER IF EXISTS artists_au`,
		// `DROP TRIGGER IF EXISTS artists_ad`,

		// Create FTS5 virtual table for artists
		`CREATE VIRTUAL TABLE IF NOT EXISTS artists_fts USING fts5(
			name, content='artists', content_rowid='id'
		)`,

		// Trigger to keep artists FTS table in sync when inserting
		`CREATE TRIGGER IF NOT EXISTS artists_ai AFTER INSERT ON artists BEGIN
			INSERT INTO artists_fts(rowid, name) 
			VALUES (new.id, new.name);
		END`,

		// Trigger to keep artists FTS table in sync when updating
		`CREATE TRIGGER IF NOT EXISTS artists_au AFTER UPDATE ON artists BEGIN
			INSERT INTO artists_fts(artists_fts, rowid, name) 
			VALUES('delete', old.id, old.name);
			INSERT INTO artists_fts(rowid, name) 
			VALUES (new.id, new.name);
		END`,

		// Trigger to keep artists FTS table in sync when deleting
		`CREATE TRIGGER IF NOT EXISTS artists_ad AFTER DELETE ON artists BEGIN
			INSERT INTO artists_fts(artists_fts, rowid, name) 
			VALUES('delete', old.id, old.name);
		END`,
	}

	for _, query := range ftsQueries {
		if err := db.Exec(query).Error; err != nil {
			return fmt.Errorf("failed to execute artists FTS query: %w", err)
		}
	}

	return nil
}

// SearchFTS performs full-text search on the specified table
// Returns query template that returns target table ids
func SearchFTS(table string) string {
	ftsTable := fmt.Sprintf("%s_fts", table)
	return fmt.Sprintf("%s.id IN (SELECT %s.rowid FROM %s WHERE %s MATCH ?)", table, ftsTable, ftsTable, ftsTable)
}

// RebuildFTS rebuilds the FTS index for a specific table
func RebuildFTS(ctx context.Context, table string) error {
	db := GetDB(ctx)
	ftsTable := fmt.Sprintf("%s_fts", table)
	return db.Exec(fmt.Sprintf("INSERT INTO %s(%s) VALUES('rebuild')", ftsTable, ftsTable)).Error
}
