package entity

type AuthStatus string

const (
	AuthStatus_WaitingForConfirmation AuthStatus = "waiting_for_confirmation"
	AuthStatus_Active                 AuthStatus = "active"
)

type AuthType string

const (
	AuthType_Email AuthType = "email"
)

type Auth struct {
	BaseEntity
	UserID     uint       `gorm:"not null" json:"user_id,omitempty"` // Foreign key to User
	User       *User      `json:"user"`
	Identity   string     `gorm:"uniqueIndex" json:"identity,omitempty"` // Unique identity for the auth method (e.g., email)
	ActionCode string     `json:"action_code,omitempty"`                 // Action code for email confirmation or other actions
	Type       AuthType   `gorm:"not null" json:"type"`
	Status     AuthStatus `gorm:"not null" json:"status,omitempty"`
}
