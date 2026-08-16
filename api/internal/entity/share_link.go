package entity

// ShareLink is a revocable link that grants read-only access to the owner's
// private collection. Revoking a link soft-deletes it, which immediately cuts
// access for everyone who redeemed it.
type ShareLink struct {
	BaseEntity
	Code    string `gorm:"uniqueIndex;not null" json:"code"`
	OwnerID uint   `gorm:"not null;index" json:"owner_id"`
	Owner   *User  `json:"-"`
}

// ShareGrant records that a viewer (grantee) redeemed a share link. Access is
// derived by joining a grant to a non-deleted ShareLink.
type ShareGrant struct {
	BaseEntity
	ShareLinkID uint       `gorm:"not null;index" json:"share_link_id"`
	ShareLink   *ShareLink `json:"-"`
	GranteeID   uint       `gorm:"not null;index" json:"grantee_id"`
}
