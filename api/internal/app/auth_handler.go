package app

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"chords.com/api/internal/auth"
	"chords.com/api/internal/config"
	"chords.com/api/internal/entity"
	"chords.com/api/internal/orm"
	"chords.com/api/internal/usecase"
	"github.com/go-chi/chi/v5"
)

type LoginResponse struct {
	UserID       uint   `json:"user_id,omitempty"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

func createAccessToken(user *entity.User) *auth.AccessToken {
	return &auth.AccessToken{
		UserID: user.ID,
	}
}

func createRefreshToken(userID uint) string {
	return fmt.Sprintf("refresh_token_for_user_%d", userID)
}

func (a *App) createLoginResponse(user *entity.User) (*LoginResponse, error) {
	conf := config.New()
	token := createAccessToken(user)

	tokenString, err := token.Encode(conf.Secret, conf.AccessTokenExpiresInSeconds)
	if err != nil {
		return nil, fmt.Errorf("failed to encode access token: %w", err)
	}

	response := LoginResponse{
		UserID:       user.ID,
		AccessToken:  tokenString,
		RefreshToken: createRefreshToken(user.ID),
	}

	return &response, nil
}

func (a *App) respondAccessToken(w http.ResponseWriter, user *entity.User) {
	response, err := a.createLoginResponse(user)
	if err != nil {
		a.respondError(w, http.StatusInternalServerError, err)
		return
	}
	a.respondJSON(w, http.StatusOK, response)
}

// AnonymousLogIn godoc
//
//	@ID				anonymousLogIn
//	@Summary		Anonymous Log In
//	@Description	Create an anonymous access token
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Success		200	{object}	LoginResponse
//	@Router			/api/auth/anonymous [post]
func (a *App) AnonymousLogIn(w http.ResponseWriter, r *http.Request) {
	tx := orm.GetDB(r.Context())
	user := entity.User{
		Status: entity.UserStatus_Anonymous,
	}
	if err := tx.Create(&user).Error; err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to create anonymous user: %w", err))
		return
	}

	a.respondAccessToken(w, &user)
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token"`
}

// RefreshToken godoc
//
//	@ID				refreshToken
//	@Summary		Refresh Access Token
//	@Description	Refresh an access token using a refresh token
//	@Tags			Auth
//	@Produce		json
//	@Param			data	body		RefreshTokenRequest	true	"Refresh Token Request"
//	@Success		200		{object}	LoginResponse
//	@Router			/api/auth/refresh-token [post]
func (a *App) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	if err := parseBody(w, r, &req); err != nil {
		return
	}

	userIDstr := strings.TrimPrefix(req.RefreshToken, "refresh_token_for_user_")
	if userIDstr == "" {
		a.respondError(w, http.StatusBadRequest, fmt.Errorf("invalid refresh token format"))
		return
	}
	userID, err := strconv.ParseUint(userIDstr, 10, 64)
	if err != nil {
		a.respondError(w, http.StatusBadRequest, fmt.Errorf("invalid user ID in refresh token: %w", err))
		return
	}

	tx := orm.GetDB(r.Context())
	user := entity.User{}
	if err := tx.First(&user, userID).Error; err != nil {
		a.respondError(w, http.StatusNotFound, fmt.Errorf("user not found: %w", err))
		return
	}

	a.respondAccessToken(w, &user)
}

type EmailAuthRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type AuthResponse struct {
	Link string `json:"link,omitempty"` // TODO remove when email confirmation is implemented
	Code string `json:"code,omitempty"` // TODO remove when email confirmation is implemented
}

// EmailAuth godoc
//
//	@ID				emailAuth
//	@Summary		Email Authentication
//	@Description	Authenticate with email without password, send sign-in link
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			data	body		EmailAuthRequest	true	"Email Auth Request"
//	@Success		200		{object}	AuthResponse
//	@Router			/api/auth/email [post]
func (a *App) EmailAuth(w http.ResponseWriter, r *http.Request) {
	var req usecase.EmailAuthRequest
	if err := parseBody(w, r, &req); err != nil {
		return
	}

	useCase := usecase.NewEmailAuthUseCase(config.New())
	result, err := useCase.Execute(r.Context(), req)
	if err != nil {
		a.handleUseCaseError(w, err)
		return
	}

	// TODO: Send email with confirmation link

	response := AuthResponse{
		Code: result.Code,
		Link: result.Link,
	}
	a.respondJSON(w, http.StatusOK, response)
}

// ConfirmAuth godoc
//
//	@ID				confirmAuth
//	@Summary		Confirm Email Authentication
//	@Description	Confirm email authentication using action code
//	@Tags			Auth
//	@Accept			json
//	@Produce		json
//	@Param			code	path		string	true	"Action Code"
//	@Success		200		{object}	LoginResponse
//	@Router			/api/auth/confirm/{code} [post]
func (a *App) ConfirmAuth(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")

	useCase := usecase.NewConfirmAuthUseCase()
	result, err := useCase.Execute(r.Context(), usecase.ConfirmAuthRequest{
		Code: code,
	})
	if err != nil {
		a.handleUseCaseError(w, err)
		return
	}

	a.respondAccessToken(w, result.User)
}

// GetAuths godoc
//
//	@ID				getAuths
//	@Summary		Get Auths
//	@Description	Get all auths for the current user
//	@Tags			User
//	@Produce		json
//	@Success		200	{array}	entity.Auth
//	@Router			/api/auths [get]
func (a *App) GetAuths(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	accessToken, err := auth.GetAccessToken(ctx)
	if err != nil {
		a.respondError(w, http.StatusUnauthorized, fmt.Errorf("failed to get access token: %w", err))
		return
	}

	auths := []entity.Auth{}
	tx := orm.GetDB(ctx)
	if err := tx.Where("user_id = ?", accessToken.UserID).Find(&auths).Error; err != nil {
		a.respondError(w, http.StatusInternalServerError, fmt.Errorf("failed to fetch auths: %w", err))
		return
	}

	a.respondJSON(w, http.StatusOK, auths)
}
