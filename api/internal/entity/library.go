package entity

type PublicLibrary struct {
	BaseEntity
	Name  string  `gorm:"not null" json:"name"`
	Songs []*Song `gorm:"many2many:public_library_songs;" json:"songs"`
}

type SearchSongRequest struct {
	Query  string `json:"query"`
	Limit  int    `json:"limit" validate:"min=1,max=100"`
	Offset int    `json:"offset" validate:"min=0"`
}

type SearchSongResponse struct {
	Songs []*SongInfo `json:"songs"`
	Total int         `json:"total"`
}
