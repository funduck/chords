package dto

import "chords.com/api/internal/entity"

type SearchSongRequest struct {
	Query       string `json:"query"`
	QueryLyrics string `json:"query_lyrics"`
	Limit       int    `json:"limit" validate:"min=1,max=100"`
	Offset      int    `json:"offset" validate:"min=0"`
	ReturnRows  bool   `json:"return_rows" default:"true"`
	ReturnTotal bool   `json:"return_total" default:"true"`
}

type SearchSongResponse struct {
	Songs []*SongInfo `json:"songs"`
	Total int64       `json:"total"`
}

type SongInfo struct {
	ID     uint               `json:"id"`
	Title  string             `json:"title"`
	Artist string             `json:"artist"`
	Format entity.SheetFormat `json:"format"`
}
