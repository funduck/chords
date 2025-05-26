package app

import "net/http"

type App struct{}

func New() *App {
	return &App{}
}

func RespondText(w http.ResponseWriter, r *http.Request, result string) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(result))
}
