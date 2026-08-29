package orm

import "chords.com/api/internal/entity"

var entities = []interface{}{
	entity.Artist{},
	entity.Auth{},
	entity.Library{},
	entity.Playlist{},
	entity.PlaylistSong{},
	entity.Room{},
	entity.ShareLink{},
	entity.ShareGrant{},
	entity.Song{},
	entity.User{},
}
