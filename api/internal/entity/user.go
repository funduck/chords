package entity

type UserStatus string

const (
	UserStatus_Anonymous              UserStatus = "anonymous"
	UserStatus_WaitingForConfirmation UserStatus = "waiting_for_confirmation"
	UserStatus_Active                 UserStatus = "active"
)

type User struct {
	BaseEntity
	Status      UserStatus `gorm:"not null" json:"status,omitempty"`
	MyRooms     []*Room    `gorm:"foreignKey:OwnerID" json:"-"`
	Rooms       []*Room    `gorm:"many2many:room_users;" json:"-"`
	MyLibraries []*Library `gorm:"foreignKey:OwnerID" json:"-"`
	MySongs     []*Song    `gorm:"foreignKey:OwnerID" json:"-"`
}
