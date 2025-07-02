package entity

type SheetFormat string

const (
	SheetFormat_Chordpro SheetFormat = "chordpro"
)

type Song struct {
	BaseEntity
	Title    string      `gorm:"not null" json:"title"`
	Artist   string      `json:"artist"`
	Composer string      `json:"composer"`
	Sheet    string      `gorm:"not null" json:"sheet"`
	Format   SheetFormat `gorm:"not null" json:"format"`
}
