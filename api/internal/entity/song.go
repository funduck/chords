package entity

type SheetFormat string

const (
	SheetFormat_Chordpro SheetFormat = "chordpro"
)

type Song struct {
	BaseEntity
	Title     string      `gorm:"not null" json:"title"`
	Artists   []*Artist   `gorm:"many2many:song_artists;" json:"artists,omitempty"`
	Composers []*Artist   `gorm:"many2many:song_composers;" json:"composers,omitempty"`
	Sheet     string      `gorm:"not null" json:"sheet"`
	Format    SheetFormat `gorm:"not null" json:"format"`
	OwnerID   uint        `gorm:"not null" json:"owner_id"` // ID of the user who uploaded this song
}

type SongInfo struct {
	Song
	Cursor string `json:"cursor,omitempty"` // Used for pagination
}

type SongsList struct {
	Songs []*SongInfo `json:"songs"`
	Total int64       `json:"total"`
}
