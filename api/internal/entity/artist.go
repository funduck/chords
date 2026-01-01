package entity

type Artist struct {
	BaseEntity
	Name           string  `gorm:"not null" json:"name" validate:"required"`
	NameNormalized string  `gorm:"not null;index" json:"-"`
	Songs          []*Song `gorm:"many2many:song_artists;" json:"-"`
	Compositions   []*Song `gorm:"many2many:song_composers;" json:"-"`
}

type ArtistInfo struct {
	Artist
	Cursor           string `json:"cursor,omitempty"` // Used for pagination
	SongCount        int64  `json:"song_count"`
	CompositionCount int64  `json:"composition_count"`
}

type ArtistsList struct {
	Artists []*ArtistInfo `json:"entities"`
	Total   int64         `json:"total"`
}
