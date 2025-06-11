package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"chords.com/api/internal/auth"
	"github.com/go-chi/chi/v5"
	"gopkg.in/go-playground/validator.v9"
)

type ErrorResponse struct {
	Message string `json:"message"`
}

func newErrorResponse(msg string) *ErrorResponse {
	return &ErrorResponse{
		Message: msg,
	}
}

var validate = validator.New()

func parseBody[T any](w http.ResponseWriter, r *http.Request, t *T) error {
	if err := json.NewDecoder(r.Body).Decode(t); err != nil {
		e := newErrorResponse(err.Error())
		e.writeError(w, http.StatusInternalServerError)
		return err
	}

	if err := validate.Struct(t); err != nil {
		e := newErrorResponse(err.Error())
		e.writeError(w, http.StatusBadRequest)
		return err
	}

	return nil
}

func parseURLParamUint(w http.ResponseWriter, r *http.Request, param string) (uint, error) {
	paramValue := chi.URLParam(r, param)
	if paramValue == "" {
		e := newErrorResponse(fmt.Sprintf("missing URL parameter: %s", param))
		e.writeError(w, http.StatusBadRequest)
		return 0, fmt.Errorf("missing URL parameter: %s", param)
	}
	id, err := strconv.ParseUint(paramValue, 10, 32)
	if err != nil {
		e := newErrorResponse(fmt.Sprintf("invalid URL parameter %s: %v", param, err))
		e.writeError(w, http.StatusBadRequest)
		return 0, fmt.Errorf("invalid URL parameter %s: %v", param, err)
	}
	return uint(id), nil
}

func (er ErrorResponse) writeError(w http.ResponseWriter, code int) {
	w.WriteHeader(code)

	e, err := json.Marshal(er)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("json marshal error"))
		return
	}

	w.Write(e)
}

func getAccessToken(w http.ResponseWriter, r *http.Request) (*auth.AccessToken, error) {
	accessToken, err := auth.GetAccessToken(r.Context())
	if err != nil {
		e := newErrorResponse(fmt.Sprintf("failed to get access token: %v", err))
		e.writeError(w, http.StatusUnauthorized)
		return nil, err
	}
	return accessToken, nil
}

func (a *App) respondError(w http.ResponseWriter, code int, err error) {
	s := fmt.Sprintf("error: %v", err)
	a.logger.Error(s)
	e := newErrorResponse(s)
	e.writeError(w, code)
}

func (a *App) respondJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	byteResp := bytes.NewBuffer(make([]byte, 0))
	if err := json.NewEncoder(byteResp).Encode(data); err != nil {
		a.logger.Errorf("marshal response error: %v", err)
		e := newErrorResponse(err.Error())
		e.writeError(w, http.StatusInternalServerError)
	}

	w.WriteHeader(statusCode)
	w.Header().Set("Content-Type", "application/json")
	w.Write(byteResp.Bytes())
}
