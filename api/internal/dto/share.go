package dto

import "time"

// ShareLinkInfo describes a share link owned by the current user.
type ShareLinkInfo struct {
	ID        uint      `json:"id"`
	Code      string    `json:"code"`
	CreatedAt time.Time `json:"created_at"`
}

// CreateShareLinkResponse is returned when a new share link is created.
type CreateShareLinkResponse struct {
	Code string `json:"code"`
}

// RedeemResponse is returned after a viewer redeems a share link.
type RedeemResponse struct {
	OwnerID uint   `json:"owner_id"`
	Label   string `json:"label"`
}

// SharedCollection is a collection the current user can browse via a redeemed link.
type SharedCollection struct {
	OwnerID uint   `json:"owner_id"`
	Label   string `json:"label"`
}
