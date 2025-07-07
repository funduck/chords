package entity

import (
	"time"

	"gorm.io/gorm"
)

type DeletedAt struct {
	gorm.DeletedAt
}

type BaseEntity struct {
	ID        uint      `gorm:"primarykey" json:"id" validate:"required"`
	CreatedAt time.Time `json:"created_at" validate:"required"`
	UpdatedAt time.Time `json:"updated_at" validate:"required"`
	DeletedAt DeletedAt `gorm:"index" json:"deleted_at,omitempty" swaggertype:"string" example:"2025-06-18T15:04:05Z"`
}

func (d DeletedAt) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return []byte("null"), nil
	}
	return d.Time.MarshalJSON()
}

func (d *DeletedAt) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		d.Time = time.Time{}
		d.Valid = false
		return nil
	}
	var t time.Time
	if err := t.UnmarshalJSON(data); err != nil {
		return err
	}
	d.Time = t
	d.Valid = true
	return nil
}
