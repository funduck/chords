package entity

import (
	"encoding/json"

	"gorm.io/gorm"
)

type Room struct {
	BaseEntity
	Code    string `gorm:"unique;not null" json:"code"`
	OwnerID uint
	Users   []*User         `gorm:"many2many:room_users;"`
	StateDB json.RawMessage `json:"-" gorm:"column:state;type:json"`
	State   interface{}     `json:"state" gorm:"-"`
}

func (r *Room) AfterFind(tx *gorm.DB) (err error) {
	if len(r.StateDB) > 0 {
		r.State = make(map[string]interface{})
		if err := json.Unmarshal(r.StateDB, &r.State); err != nil {
			return err
		}
	}
	return nil
}

func (r *Room) BeforeSave(tx *gorm.DB) (err error) {
	if r.State != nil {
		state, err := json.Marshal(r.State)
		if err != nil {
			return err
		}
		r.StateDB = state
	} else {
		r.StateDB = json.RawMessage{}
	}
	return nil
}

type JoinRoomRequest struct {
	RoomCode string `json:"room_code"`
}

type UpdateRoomRequest struct {
	State interface{} `json:"state"`
}

func (r *Room) Update(request *UpdateRoomRequest) {
	if request.State != nil {
		r.State = request.State
	}
}
