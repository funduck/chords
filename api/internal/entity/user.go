package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
	IsAnonymous bool   `gorm:"default:false"`
	MyRooms     []Room `gorm:"foreignKey:OwnerID"`
	Rooms       []Room `gorm:"many2many:room_users;"`
}
