package auth

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var issuer = "chords.com"

type AccessToken struct {
	UserID      uint
	IsAnonymous bool
}

type Claims struct {
	jwt.RegisteredClaims
	IsAnonymous bool `json:"is_anonymous,omitempty"`
}

func (at *AccessToken) Decode(tokenString string, secretKey string) error {
	claims := Claims{}
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing method is HMAC
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secretKey), nil
	})
	if err != nil {
		return err
	}
	if !token.Valid {
		return errors.New("invalid token")
	}

	userID, err := strconv.ParseUint(claims.Subject, 10, 64)
	if err != nil {
		return errors.New("invalid user ID in token")
	}
	at.UserID = uint(userID)
	at.IsAnonymous = claims.IsAnonymous

	return nil
}

func (at *AccessToken) Encode(secretKey string, expiresInSeconds int64) (string, error) {
	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   fmt.Sprint(at.UserID),
			ExpiresAt: jwt.NewNumericDate(jwt.TimeFunc().Add(time.Duration(expiresInSeconds) * time.Second)),
		},
		IsAnonymous: at.IsAnonymous,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

type accessTokenKeyType string

var accessTokenKey accessTokenKeyType = "access_token"

func SetAccessToken(ctx context.Context, at *AccessToken) context.Context {
	if at == nil {
		return ctx
	}
	return context.WithValue(ctx, accessTokenKey, at)
}

func GetAccessToken(ctx context.Context) (*AccessToken, error) {
	at, ok := ctx.Value(accessTokenKey).(*AccessToken)
	if !ok || at == nil {
		return nil, errors.New("access token not found in context")
	}
	return at, nil
}
