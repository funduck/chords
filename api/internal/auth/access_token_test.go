package auth

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAccessTokenEncodeDecode(t *testing.T) {
	// Create an access token
	token := AccessToken{
		UserID:      12345,
		IsAnonymous: false,
	}

	secret := "mysecretkey"
	expireSeconds := int64(3600) // 1 hour

	// Encode the token
	encoded, err := token.Encode(secret, expireSeconds)
	assert.NoError(t, err, "failed to encode access token")

	// Decode the token
	decoded := AccessToken{}
	err = decoded.Decode(encoded, secret)
	assert.NoError(t, err, "failed to decode access token")

	// Verify the decoded token matches the original
	if decoded.UserID != token.UserID {
		t.Errorf("expected UserID %v, got %v", token.UserID, decoded.UserID)
	}
}
