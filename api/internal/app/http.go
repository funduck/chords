package app

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

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
