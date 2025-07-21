package usecase

import (
	"context"
	"testing"

	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"github.com/stretchr/testify/assert"
)

func TestEmailAuthUseCase_Execute(t *testing.T) {
	config.InitForTest()
	db, _ := orm.InitForTest()
	defer orm.Close()

	ctx := context.Background()
	ctx = orm.WithDB(ctx, db)

	// Create test config
	conf := &config.Config{
		ConfirmationLink: "http://localhost:3000/confirm/{code}",
	}

	t.Run("successful email auth with new user", func(t *testing.T) {
		uc := NewEmailAuthUseCase(conf)
		result, err := uc.Execute(ctx, EmailAuthRequest{
			Email: "newuser@example.com",
		})

		// Verify result
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotEmpty(t, result.Link)
		assert.Contains(t, result.Link, "http://localhost:3000/confirm/")
		assert.NotNil(t, result.User)
		assert.Equal(t, entity.UserStatus_WaitingForConfirmation, result.User.Status)

		// Verify database changes
		var authEntity entity.Auth
		err = db.Preload("User").Where("identity = ? AND type = ?", "newuser@example.com", entity.AuthType_Email).First(&authEntity).Error
		assert.NoError(t, err)
		assert.Equal(t, "newuser@example.com", authEntity.Identity)
		assert.Equal(t, entity.AuthType_Email, authEntity.Type)
		assert.Equal(t, entity.AuthStatus_WaitingForConfirmation, authEntity.Status)
		assert.NotEmpty(t, authEntity.ActionCode)
		assert.Equal(t, entity.UserStatus_WaitingForConfirmation, authEntity.User.Status)

		// Verify link contains the action code
		assert.Contains(t, result.Link, authEntity.ActionCode)
	})

	t.Run("successful email auth with existing waiting user", func(t *testing.T) {
		// Create existing user and auth entity
		user := &entity.User{
			Status: entity.UserStatus_WaitingForConfirmation,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "existing@example.com",
			ActionCode: "old-action-code",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_WaitingForConfirmation,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		uc := NewEmailAuthUseCase(conf)
		result, err := uc.Execute(ctx, EmailAuthRequest{
			Email: "existing@example.com",
		})

		// Verify result
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotEmpty(t, result.Link)
		assert.Contains(t, result.Link, "http://localhost:3000/confirm/")
		assert.NotNil(t, result.User)
		assert.Equal(t, entity.UserStatus_WaitingForConfirmation, result.User.Status)

		// Verify database changes - action code should be updated
		var updatedAuth entity.Auth
		err = db.Preload("User").First(&updatedAuth, authEntity.ID).Error
		assert.NoError(t, err)
		assert.NotEqual(t, "old-action-code", updatedAuth.ActionCode)
		assert.NotEmpty(t, updatedAuth.ActionCode)
		assert.Contains(t, result.Link, updatedAuth.ActionCode)
	})

	t.Run("successful email auth with existing active user", func(t *testing.T) {
		// Create existing active user and auth entity
		user := &entity.User{
			Status: entity.UserStatus_Active,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "active@example.com",
			ActionCode: "",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_Active,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		uc := NewEmailAuthUseCase(conf)
		result, err := uc.Execute(ctx, EmailAuthRequest{
			Email: "active@example.com",
		})

		// Verify result
		assert.NoError(t, err)
		assert.NotNil(t, result)
		assert.NotEmpty(t, result.Link)
		assert.Contains(t, result.Link, "http://localhost:3000/confirm/")
		assert.NotNil(t, result.User)
		assert.Equal(t, entity.UserStatus_Active, result.User.Status)

		// Verify database changes - new action code generated
		var updatedAuth entity.Auth
		err = db.Preload("User").First(&updatedAuth, authEntity.ID).Error
		assert.NoError(t, err)
		assert.NotEmpty(t, updatedAuth.ActionCode)
		assert.Contains(t, result.Link, updatedAuth.ActionCode)
	})

	t.Run("user with invalid status returns business error", func(t *testing.T) {
		// Create user with anonymous status (invalid for email auth)
		user := &entity.User{
			Status: entity.UserStatus_Anonymous,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "anonymous@example.com",
			ActionCode: "",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_WaitingForConfirmation,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		uc := NewEmailAuthUseCase(conf)
		result, err := uc.Execute(ctx, EmailAuthRequest{
			Email: "anonymous@example.com",
		})

		// Verify error
		assert.Error(t, err)
		assert.Nil(t, result)

		useCaseErr, ok := err.(*UseCaseError)
		assert.True(t, ok)
		assert.Equal(t, ErrorTypeBusiness, useCaseErr.Type)
		assert.Contains(t, useCaseErr.Message, "user status is not valid")
		assert.Contains(t, useCaseErr.Message, string(entity.UserStatus_Anonymous))
	})

	t.Run("empty email validation", func(t *testing.T) {
		uc := NewEmailAuthUseCase(conf)
		result, err := uc.Execute(ctx, EmailAuthRequest{
			Email: "",
		})
		assert.Error(t, err)
		assert.Nil(t, result)
	})
}

func TestEmailAuthUseCase_findOrCreateAuth(t *testing.T) {
	config.InitForTest()
	db, _ := orm.InitForTest()
	defer orm.Close()

	conf := &config.Config{
		ConfirmationLink: "http://localhost:3000/confirm/{code}",
	}
	uc := NewEmailAuthUseCase(conf)

	t.Run("create new auth entity", func(t *testing.T) {
		tx := db.Begin()
		defer tx.Rollback()

		authEntity, err := uc.findOrCreateAuth(tx, "newauth@example.com")

		assert.NoError(t, err)
		assert.NotNil(t, authEntity)
		assert.Equal(t, "newauth@example.com", authEntity.Identity)
		assert.Equal(t, entity.AuthType_Email, authEntity.Type)
		assert.Equal(t, entity.AuthStatus_WaitingForConfirmation, authEntity.Status)
		assert.NotNil(t, authEntity.User)
		assert.Equal(t, entity.UserStatus_WaitingForConfirmation, authEntity.User.Status)
	})

	t.Run("find existing auth entity", func(t *testing.T) {
		// Create existing auth entity
		user := &entity.User{
			Status: entity.UserStatus_Active,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		existingAuth := &entity.Auth{
			User:     user,
			Identity: "existing@example.com",
			Type:     entity.AuthType_Email,
			Status:   entity.AuthStatus_Active,
		}
		err = db.Create(existingAuth).Error
		assert.NoError(t, err)

		tx := db.Begin()
		defer tx.Rollback()

		authEntity, err := uc.findOrCreateAuth(tx, "existing@example.com")

		assert.NoError(t, err)
		assert.NotNil(t, authEntity)
		assert.Equal(t, existingAuth.ID, authEntity.ID)
		assert.Equal(t, "existing@example.com", authEntity.Identity)
		assert.Equal(t, entity.AuthType_Email, authEntity.Type)
		assert.Equal(t, entity.AuthStatus_Active, authEntity.Status)
		assert.Equal(t, entity.UserStatus_Active, authEntity.User.Status)
	})
}

func TestEmailAuthUseCase_validateUserStatus(t *testing.T) {
	conf := &config.Config{
		ConfirmationLink: "http://localhost:3000/confirm/{code}",
	}
	uc := NewEmailAuthUseCase(conf)

	t.Run("valid waiting for confirmation status", func(t *testing.T) {
		user := &entity.User{
			Status: entity.UserStatus_WaitingForConfirmation,
		}

		err := uc.validateUserStatus(user)
		assert.NoError(t, err)
	})

	t.Run("valid active status", func(t *testing.T) {
		user := &entity.User{
			Status: entity.UserStatus_Active,
		}

		err := uc.validateUserStatus(user)
		assert.NoError(t, err)
	})

	t.Run("invalid anonymous status", func(t *testing.T) {
		user := &entity.User{
			Status: entity.UserStatus_Anonymous,
		}

		err := uc.validateUserStatus(user)
		assert.Error(t, err)

		useCaseErr, ok := err.(*UseCaseError)
		assert.True(t, ok)
		assert.Equal(t, ErrorTypeBusiness, useCaseErr.Type)
		assert.Contains(t, useCaseErr.Message, "user status is not valid")
		assert.Contains(t, useCaseErr.Message, string(entity.UserStatus_Anonymous))
	})
}

func TestEmailAuthUseCase_saveAuthAndUser(t *testing.T) {
	config.InitForTest()
	db, _ := orm.InitForTest()
	defer orm.Close()

	conf := &config.Config{
		ConfirmationLink: "http://localhost:3000/confirm/{code}",
	}
	uc := NewEmailAuthUseCase(conf)

	t.Run("successful save", func(t *testing.T) {
		user := &entity.User{
			Status: entity.UserStatus_WaitingForConfirmation,
		}
		err := db.Create(user).Error
		assert.NoError(t, err)

		authEntity := &entity.Auth{
			User:       user,
			Identity:   "save@example.com",
			ActionCode: "test-action-code",
			Type:       entity.AuthType_Email,
			Status:     entity.AuthStatus_WaitingForConfirmation,
		}
		err = db.Create(authEntity).Error
		assert.NoError(t, err)

		// Update action code
		authEntity.ActionCode = "new-action-code"

		tx := db.Begin()
		defer tx.Rollback()

		err = uc.saveAuthAndUser(tx, authEntity)
		assert.NoError(t, err)

		// Verify changes are saved
		var savedAuth entity.Auth
		err = tx.Preload("User").First(&savedAuth, authEntity.ID).Error
		assert.NoError(t, err)
		assert.Equal(t, "new-action-code", savedAuth.ActionCode)
	})
}

func TestNewEmailAuthUseCase(t *testing.T) {
	t.Run("NewEmailAuthUseCase returns instance with config", func(t *testing.T) {
		conf := &config.Config{
			ConfirmationLink: "http://localhost:3000/confirm/{code}",
		}
		uc := NewEmailAuthUseCase(conf)

		assert.NotNil(t, uc)
		assert.IsType(t, &EmailAuthUseCase{}, uc)
		assert.Equal(t, conf, uc.config)
	})
}
