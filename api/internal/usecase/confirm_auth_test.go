package usecase

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestConfirmAuthUseCase_Execute(t *testing.T) {
	config.InitForTest()
	db, _ := orm.InitForTest()
	defer orm.Close()

	ctx := context.Background()
	ctx = orm.WithDB(ctx, db)

	t.Run("successful confirmation", func(t *testing.T) {
		// Create test user and auth entity
		user := &entity.User{
			Status: entity.UserStatus_WaitingForConfirmation,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "test@example.com",
			ActionCode: "test-action-code",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_WaitingForConfirmation,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		// Execute use case
		uc := NewConfirmAuthUseCase()
		result, err := uc.Execute(ctx, ConfirmAuthRequest{
			Code: "test-action-code",
		})

		// Verify result
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotNil(t, result.User)
		assert.Equal(t, entity.UserStatus_Active, result.User.Status)

		// Verify database changes
		var updatedAuth entity.Auth
		err = db.Preload("User").First(&updatedAuth, authEntity.ID).Error
		assert.NoError(t, err)
		assert.Empty(t, updatedAuth.ActionCode)
		assert.Equal(t, entity.AuthStatus_Active, updatedAuth.Status)
		assert.Equal(t, entity.UserStatus_Active, updatedAuth.User.Status)
	})

	t.Run("empty code returns validation error", func(t *testing.T) {
		uc := NewConfirmAuthUseCase()
		result, err := uc.Execute(ctx, ConfirmAuthRequest{
			Code: "",
		})

		assert.Error(t, err)
		assert.Nil(t, result)

		useCaseErr, ok := err.(*UseCaseError)
		assert.True(t, ok)
		assert.Equal(t, ErrorTypeValidation, useCaseErr.Type)
		assert.Equal(t, "confirmation code is required", useCaseErr.Message)
	})

	t.Run("invalid code returns validation error", func(t *testing.T) {
		uc := NewConfirmAuthUseCase()
		result, err := uc.Execute(ctx, ConfirmAuthRequest{
			Code: "invalid-code",
		})

		assert.Error(t, err)
		assert.Nil(t, result)

		useCaseErr, ok := err.(*UseCaseError)
		assert.True(t, ok)
		assert.Equal(t, ErrorTypeValidation, useCaseErr.Type)
		assert.Equal(t, "user not found for confirmation code", useCaseErr.Message)
	})

	t.Run("already active user remains active", func(t *testing.T) {
		// Create test user and auth entity with active status
		user := &entity.User{
			Status: entity.UserStatus_Active,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "active@example.com",
			ActionCode: "active-action-code",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_Active,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		// Execute use case
		uc := NewConfirmAuthUseCase()
		result, err := uc.Execute(ctx, ConfirmAuthRequest{
			Code: "active-action-code",
		})

		// Verify result
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotNil(t, result.User)
		assert.Equal(t, entity.UserStatus_Active, result.User.Status)

		// Verify database changes
		var updatedAuth entity.Auth
		err = db.Preload("User").First(&updatedAuth, authEntity.ID).Error
		assert.NoError(t, err)
		assert.Empty(t, updatedAuth.ActionCode)
		assert.Equal(t, entity.AuthStatus_Active, updatedAuth.Status)
		assert.Equal(t, entity.UserStatus_Active, updatedAuth.User.Status)
	})
}

func TestNewConfirmAuthUseCase(t *testing.T) {
	t.Run("NewConfirmAuthUseCase returns instance", func(t *testing.T) {
		uc := NewConfirmAuthUseCase()

		assert.NotNil(t, uc)
		assert.IsType(t, &ConfirmAuthUseCase{}, uc)
	})
}
