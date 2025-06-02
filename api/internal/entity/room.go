package entity

import "gorm.io/gorm"

type Room struct {
	gorm.Model
	Code    string `json:"code" gorm:"unique;not null"`
	OwnerID uint
	Users   []User `gorm:"many2many:room_users;"`
}
