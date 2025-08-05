package entity

type LibraryType string

const (
	LibraryType_Public    LibraryType = "public"    // anyone can access
	LibraryType_Favorites LibraryType = "favorites" // user's favorite songs
	LibraryType_Private   LibraryType = "private"   // only the owner can access
)

type Library struct {
	BaseEntity
	Name    string      `gorm:"not null" json:"name"`
	Type    LibraryType `gorm:"not null" json:"type"`
	OwnerID uint        `gorm:"not null" json:"owner_id"`
	Songs   []*Song     `gorm:"many2many:library_songs;" json:"songs"`
	Artists []*Artist   `gorm:"many2many:library_artists;" json:"artists"`
}
