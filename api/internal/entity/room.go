package entity

type Room struct {
	BaseEntity
	Code    string `json:"code" gorm:"unique;not null"`
	OwnerID uint
	Users   []User `gorm:"many2many:room_users;"`
}
