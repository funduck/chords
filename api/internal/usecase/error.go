package usecase

// Custom error types for better error handling
type UseCaseError struct {
	Type    string
	Message string
	Err     error
}

func (e *UseCaseError) Error() string {
	return e.Message
}

func (e *UseCaseError) Unwrap() error {
	return e.Err
}

const (
	ErrorTypeValidation = "validation"
	ErrorTypeDatabase   = "database"
	ErrorTypeBusiness   = "business"
)
