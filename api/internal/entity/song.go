package entity

type SheetFormat string

const (
	SheetFormat_Chordpro        SheetFormat = "chordpro"
	SheetFormat_ChordsOverWords SheetFormat = "chords_over_words"
)

type Song struct {
	BaseEntity
	Title     string      `gorm:"not null" json:"title" validate:"required"`
	Artists   []*Artist   `gorm:"many2many:song_artists;" json:"artists,omitempty"`
	Composers []*Artist   `gorm:"many2many:song_composers;" json:"composers,omitempty"`
	Lyrics    string      `gorm:"not null" json:"-"`
	Sheet     string      `gorm:"not null" json:"sheet" validate:"required"`
	Format    SheetFormat `gorm:"not null" json:"format" validate:"required"`
	OwnerID   uint        `gorm:"not null" json:"owner_id"` // ID of the user who uploaded this song
}

type SongInfo struct {
	Song
	Cursor string `json:"cursor,omitempty"` // Used for pagination
}

type SongsList struct {
	Songs []*SongInfo `json:"entities"`
	Total int64       `json:"total"`
}
