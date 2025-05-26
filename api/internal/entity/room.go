package entity

type Room struct {
	ID   string `json:"id" gorm:"primaryKey;autoIncrement"`
	Code string `json:"code" gorm:"unique;not null"`
}
