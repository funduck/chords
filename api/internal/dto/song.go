package dto

import "chords.com/api/internal/entity"

type CreateSongRequest struct {
	Artists   []string           `json:"artists"`
	Composers []string           `json:"composers"`
	Lyrics    string             `json:"lyrics"` // Pass if you want to make lyrics searchable
	Format    entity.SheetFormat `json:"format" validate:"required"`
	Sheet     string             `json:"sheet" validate:"required"`
	Title     string             `json:"title" validate:"required"`
}

type UpdateSongRequest struct {
	Sheet  string `json:"sheet" validate:"required"`
	Lyrics string `json:"lyrics"` // Pass if you want to make lyrics searchable
}
