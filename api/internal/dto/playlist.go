package dto

// CreatePlaylistRequest is the body of a create-playlist call.
type CreatePlaylistRequest struct {
	Name string `json:"name" validate:"required"`
}
