package entity

import "gorm.io/gorm"

type User struct {
	gorm.Model
	MyRooms []Room `gorm:"foreignKey:OwnerID"`
	Rooms   []Room `gorm:"many2many:room_users;"`
}
