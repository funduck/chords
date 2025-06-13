package entity

type User struct {
	BaseEntity
	IsAnonymous bool    `gorm:"default:false"`
	MyRooms     []*Room `gorm:"foreignKey:OwnerID"`
	Rooms       []*Room `gorm:"many2many:room_users;"`
}
