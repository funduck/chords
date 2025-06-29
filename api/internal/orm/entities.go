package orm

import "chords.com/api/internal/entity"

var entities = []interface{}{
	entity.Room{},
	entity.User{},
	entity.PublicLibrary{},
	entity.Song{},
}
