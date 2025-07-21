package orm

import "chords.com/api/internal/entity"

var entities = []interface{}{
	entity.Artist{},
	entity.Auth{},
	entity.Library{},
	entity.Room{},
	entity.Song{},
	entity.User{},
}
