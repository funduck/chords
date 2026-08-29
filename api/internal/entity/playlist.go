package entity

// Playlist is a named, owner-scoped collection of songs used to prepare a set
// for a gig. Playlists follow the share model: sharing a library also shares
// its playlists, read-only.
type Playlist struct {
	BaseEntity
	Name    string `gorm:"not null" json:"name" validate:"required"`
	OwnerID uint   `gorm:"not null;index" json:"owner_id"`
}

// PlaylistSong is an explicit join model (rather than many2many) so it can
// carry Position. Rows are hard-deleted; there is no DeletedAt.
type PlaylistSong struct {
	PlaylistID uint `gorm:"primaryKey" json:"playlist_id"`
	SongID     uint `gorm:"primaryKey" json:"song_id"`
	Position   int  `json:"position"`
}

// PlaylistInfo is a playlist enriched with the number of songs it holds.
type PlaylistInfo struct {
	Playlist
	SongCount int64 `json:"song_count"`
}
