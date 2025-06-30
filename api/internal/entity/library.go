package entity

type PublicLibrary struct {
	BaseEntity
	Name  string  `gorm:"not null" json:"name"`
	Songs []*Song `gorm:"many2many:public_library_songs;" json:"songs"`
}
