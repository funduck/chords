package dto

import "chords.com/api/internal/entity"

type SearchSongRequest struct {
	LibraryID    uint               `json:"library_id"`
	LibraryType  entity.LibraryType `json:"library_type"`
	ArtistID     uint               `json:"artist_id"`
	Query        string             `json:"query"`
	CursorAfter  string             `json:"cursor_after"`
	CursorBefore string             `json:"cursor_before"`
	Limit        int                `json:"limit" validate:"min=1,max=100"`
	ReturnRows   bool               `json:"return_rows" default:"true"`
	ReturnTotal  bool               `json:"return_total" default:"true"`
}
