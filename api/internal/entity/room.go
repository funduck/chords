package entity

import (
	"time"
)

type Room struct {
	ID        string     `json:"id" gorm:"primaryKey;autoIncrement"`
	Code      string     `json:"code" gorm:"unique;not null"`
	OwnerID   string     `json:"owner_id" gorm:"not null"`          // User ID of the room owner
	UserIDs   []string   `json:"user_ids" gorm:"type:text[]"`       // Array of user IDs in the room
	CreatedAt time.Time  `json:"created_at" gorm:"autoCreateTime"`  // Timestamp when the room was created
	UpdatedAt time.Time  `json:"updated_at" gorm:"autoUpdateTime"`  // Timestamp when the room was last updated
	DeletedAt *time.Time `json:"deleted_at,omitempty" gorm:"index"` // Soft delete timestamp
}
