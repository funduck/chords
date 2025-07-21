package usecase

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"gorm.io/gorm"
)

type EmailAuthUseCase struct {
	config *config.Config
}

type EmailAuthRequest struct {
	Email string `json:"email"`
}

type EmailAuthResult struct {
	Link string
	User *entity.User
}

func NewEmailAuthUseCase(config *config.Config) *EmailAuthUseCase {
	return &EmailAuthUseCase{
		config: config,
	}
}

func (uc *EmailAuthUseCase) Execute(ctx context.Context, req EmailAuthRequest) (*EmailAuthResult, error) {
	if err := uc.validateEmail(req.Email); err != nil {
		return nil, &UseCaseError{
			Type:    ErrorTypeValidation,
			Message: "invalid email format",
			Err:     err,
		}
	}

	db := orm.GetDB(ctx)
	tx := db.Begin()
	defer tx.Rollback()

	// Find or create auth entity
	authEntity, err := uc.findOrCreateAuth(tx, req.Email)
	if err != nil {
		return nil, err
	}

	// Validate user status
	if err := uc.validateUserStatus(authEntity.User); err != nil {
		return nil, err
	}

	// Generate action code and link
	authEntity.ActionCode = auth.GenerateActionCode(32)
	link := strings.ReplaceAll(uc.config.ConfirmationLink, "{code}", authEntity.ActionCode)

	// Save changes
	if err := uc.saveAuthAndUser(tx, authEntity); err != nil {
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to commit transaction",
			Err:     err,
		}
	}

	return &EmailAuthResult{
		Link: link,
		User: authEntity.User,
	}, nil
}

func (uc *EmailAuthUseCase) findOrCreateAuth(tx *gorm.DB, email string) (*entity.Auth, error) {
	var authEntity entity.Auth
	err := tx.Preload("User").Where("identity = ? AND type = ?", email, entity.AuthType_Email).
		First(&authEntity).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			authEntity = entity.Auth{
				Identity: email, // Fixed typo
				Type:     entity.AuthType_Email,
				Status:   entity.AuthStatus_WaitingForConfirmation,
				User: &entity.User{
					Status: entity.UserStatus_WaitingForConfirmation,
				},
			}
			if err := tx.Create(&authEntity).Error; err != nil {
				return nil, &UseCaseError{
					Type:    ErrorTypeDatabase,
					Message: "failed to create user",
					Err:     err,
				}
			}
		} else {
			return nil, &UseCaseError{
				Type:    ErrorTypeDatabase,
				Message: "failed to query user",
				Err:     err,
			}
		}
	}

	return &authEntity, nil
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func (uc *EmailAuthUseCase) validateEmail(email string) error {
	if email == "" {
		return errors.New("email is required")
	}
	if !emailRegex.MatchString(email) {
		return errors.New("email format is invalid")
	}
	if len(email) > 254 {
		return errors.New("email is too long")
	}

	return nil
}

func (uc *EmailAuthUseCase) validateUserStatus(user *entity.User) error {
	if user.Status != entity.UserStatus_WaitingForConfirmation &&
		user.Status != entity.UserStatus_Active {
		return &UseCaseError{
			Type:    ErrorTypeBusiness,
			Message: fmt.Sprintf("user status is not valid: %s", user.Status),
			Err:     nil,
		}
	}
	return nil
}

func (uc *EmailAuthUseCase) saveAuthAndUser(tx *gorm.DB, authEntity *entity.Auth) error {
	if err := tx.Save(authEntity).Error; err != nil {
		return &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to save auth",
			Err:     err,
		}
	}
	if err := tx.Save(authEntity.User).Error; err != nil {
		return &UseCaseError{
			Type:    ErrorTypeDatabase,
			Message: "failed to save user",
			Err:     err,
		}
	}
	return nil
}
