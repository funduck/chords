package usecase

import (
	"context"

	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type ConfirmAuthUseCase struct{}

type ConfirmAuthRequest struct {
	Code string `json:"code"`
}

type ConfirmAuthResult struct {
	User *entity.User `json:"user"`
}

func NewConfirmAuthUseCase() *ConfirmAuthUseCase {
	return &ConfirmAuthUseCase{}
}

func (uc *ConfirmAuthUseCase) Execute(ctx context.Context, req ConfirmAuthRequest) (*ConfirmAuthResult, error) {
	if req.Code == "" {
		return nil, &UseCaseError{
			Type:    ErrorTypeValidation,
			Message: "confirmation code is required",
			Err:     nil,
		}
	}

	db := orm.GetDB(ctx)
	tx := db.Begin()
	defer tx.Rollback()

	// Find auth entity by action code
	var authEntity entity.Auth
	if err := tx.Preload("User").
		Where("action_code = ? AND type = ?", req.Code, entity.AuthType_Email).
		First(&authEntity).Error; err != nil {
		if orm.IsRecordNotFoundError(err) {
			return nil, &UseCaseError{
				Type:    ErrorTypeValidation,
				Message: "user not found for confirmation code",
				Err:     nil,
			}
		}
		return nil, &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to query user",
			Err:     err,
		}
	}

	// Clear action code
	authEntity.ActionCode = ""

	// Update user status if needed
	user := authEntity.User
	if user.Status == entity.UserStatus_WaitingForConfirmation {
		user.Status = entity.UserStatus_Active
	}

	// Update auth status if needed
	if authEntity.Status == entity.AuthStatus_WaitingForConfirmation {
		authEntity.Status = entity.AuthStatus_Active
	}

	// Save auth entity
	if err := tx.Save(&authEntity).Error; err != nil {
		return nil, &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to update auth status",
			Err:     err,
		}
	}

	// Save user
	if err := tx.Save(&user).Error; err != nil {
		return nil, &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to update user status",
			Err:     err,
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to commit transaction",
			Err:     err,
		}
	}

	return &ConfirmAuthResult{
		User: user,
	}, nil
}
