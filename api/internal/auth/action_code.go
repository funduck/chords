package auth

import (
	"crypto/rand"
	"fmt"
)

func GenerateActionCode(l int) string {
	randomBytes := make([]byte, l)
	rand.Reader.Read(randomBytes) // Fill a byte slice with random data
	return fmt.Sprintf("%x", randomBytes)
}
