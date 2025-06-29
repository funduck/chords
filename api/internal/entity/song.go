package entity

type SheetFormat string

const (
	SheetFormat_Chordpro SheetFormat = "chordpro"
)

type Song struct {
	BaseEntity
	Title  string      `gorm:"not null" json:"title"`
	Artist string      `gorm:"not null" json:"artist"`
	Sheet  string      `gorm:"not null" json:"sheet"`
	Format SheetFormat `gorm:"not null" json:"format"`
}

type SongInfo struct {
	ID     uint        `json:"id"`
	Title  string      `json:"title"`
	Artist string      `json:"artist"`
	Format SheetFormat `json:"format"`
}
