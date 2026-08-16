package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"

	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/logger"
	"chords.com/api/internal/orm"
)

// ErrShareAccessDenied is returned when a user tries to browse a collection
// they have not been granted access to.
var ErrShareAccessDenied = errors.New("access to shared collection denied")

type ShareService struct {
	log logger.Logger
}

func NewShareService() *ShareService {
	return &ShareService{
		log: logger.NewForModule("ShareService"),
	}
}

// generateShareCode generates a random 8-character alphanumeric string.
func generateShareCode() (string, error) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const length = 8
	code := make([]byte, length)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", err
		}
		code[i] = charset[num.Int64()]
	}
	return string(code), nil
}

// CreateShareLink creates a new revocable share link for the given owner.
func (s *ShareService) CreateShareLink(ctx context.Context, ownerID uint) (*entity.ShareLink, error) {
	tx := orm.GetDB(ctx)

	link := &entity.ShareLink{OwnerID: ownerID}
	// Retry a few times in the unlikely event of a code collision.
	var err error
	for attempt := 0; attempt < 5; attempt++ {
		if link.Code, err = generateShareCode(); err != nil {
			return nil, err
		}
		if err = tx.Create(link).Error; err == nil {
			s.log.Infow("Created share link", "ownerID", ownerID, "code", link.Code)
			return link, nil
		}
	}
	return nil, fmt.Errorf("failed to create share link: %w", err)
}

// ListShareLinks returns the owner's active (non-revoked) share links.
func (s *ShareService) ListShareLinks(ctx context.Context, ownerID uint) ([]dto.ShareLinkInfo, error) {
	tx := orm.GetDB(ctx)

	var links []entity.ShareLink
	if err := tx.Where("owner_id = ?", ownerID).Order("created_at DESC").Find(&links).Error; err != nil {
		return nil, err
	}

	infos := make([]dto.ShareLinkInfo, 0, len(links))
	for _, l := range links {
		infos = append(infos, dto.ShareLinkInfo{ID: l.ID, Code: l.Code, CreatedAt: l.CreatedAt})
	}
	return infos, nil
}

// RevokeShareLink soft-deletes a share link owned by the given user.
func (s *ShareService) RevokeShareLink(ctx context.Context, ownerID uint, id uint) error {
	tx := orm.GetDB(ctx)

	link := entity.ShareLink{}
	if err := tx.First(&link, id).Error; err != nil {
		return err
	}
	if link.OwnerID != ownerID {
		return ErrShareAccessDenied
	}
	if err := tx.Delete(&link).Error; err != nil {
		return err
	}
	s.log.Infow("Revoked share link", "ownerID", ownerID, "linkID", id)
	return nil
}

// Redeem records that the grantee redeemed the given code and returns the owner
// of the collection they now have access to.
func (s *ShareService) Redeem(ctx context.Context, granteeID uint, code string) (*dto.RedeemResponse, error) {
	tx := orm.GetDB(ctx)

	link := entity.ShareLink{}
	if err := tx.Where("code = ?", code).First(&link).Error; err != nil {
		return nil, err
	}
	if link.OwnerID == granteeID {
		return nil, fmt.Errorf("cannot redeem your own share link")
	}

	// Only create a grant if one does not already exist for this link/grantee.
	grant := entity.ShareGrant{}
	err := tx.Where("share_link_id = ? AND grantee_id = ?", link.ID, granteeID).First(&grant).Error
	if orm.IsRecordNotFoundError(err) {
		grant = entity.ShareGrant{ShareLinkID: link.ID, GranteeID: granteeID}
		if err := tx.Create(&grant).Error; err != nil {
			return nil, err
		}
		s.log.Infow("Redeemed share link", "granteeID", granteeID, "ownerID", link.OwnerID, "code", code)
	} else if err != nil {
		return nil, err
	}

	return &dto.RedeemResponse{OwnerID: link.OwnerID, Label: s.ownerLabel(ctx, link.OwnerID)}, nil
}

// ListCollections returns the collections the grantee can currently browse.
func (s *ShareService) ListCollections(ctx context.Context, granteeID uint) ([]dto.SharedCollection, error) {
	tx := orm.GetDB(ctx)

	var ownerIDs []uint
	err := tx.Model(&entity.ShareGrant{}).
		Joins("JOIN share_links ON share_links.id = share_grants.share_link_id AND share_links.deleted_at IS NULL").
		Where("share_grants.grantee_id = ?", granteeID).
		Distinct().
		Pluck("share_links.owner_id", &ownerIDs).Error
	if err != nil {
		return nil, err
	}

	collections := make([]dto.SharedCollection, 0, len(ownerIDs))
	for _, ownerID := range ownerIDs {
		collections = append(collections, dto.SharedCollection{OwnerID: ownerID, Label: s.ownerLabel(ctx, ownerID)})
	}
	return collections, nil
}

// HasAccess reports whether the grantee can browse the given owner's collection.
func (s *ShareService) HasAccess(ctx context.Context, granteeID uint, ownerID uint) bool {
	tx := orm.GetDB(ctx)

	var count int64
	err := tx.Model(&entity.ShareGrant{}).
		Joins("JOIN share_links ON share_links.id = share_grants.share_link_id AND share_links.deleted_at IS NULL").
		Where("share_grants.grantee_id = ? AND share_links.owner_id = ?", granteeID, ownerID).
		Count(&count).Error
	if err != nil {
		s.log.Errorw("Failed to check share access", "error", err, "granteeID", granteeID, "ownerID", ownerID)
		return false
	}
	return count > 0
}

// ownerLabel returns a human-friendly label for a collection owner: their email
// if they have one, otherwise "User #<id>".
func (s *ShareService) ownerLabel(ctx context.Context, ownerID uint) string {
	tx := orm.GetDB(ctx)

	var identity string
	err := tx.Model(&entity.Auth{}).
		Where("user_id = ? AND type = ?", ownerID, entity.AuthType_Email).
		Limit(1).
		Pluck("identity", &identity).Error
	if err == nil && identity != "" {
		return identity
	}
	return fmt.Sprintf("User #%d", ownerID)
}
