package service

import (
	"context"
	"errors"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
)

type UserService struct {
	// Add dependencies here if needed (e.g., database repository)
}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) GetActiveUser(ctx context.Context) (*entity.User, error) {
	accessToken, err := auth.GetAccessToken(ctx)
	if err != nil {
		return nil, errors.New("user not authenticated")
	}

	tx := orm.GetDB(ctx)
	var user entity.User

	err = tx.First(&user, accessToken.UserID).Error

	return &user, err
}
