package app

import "net/http"

func (a *App) TestHandler(w http.ResponseWriter, r *http.Request) {
	RespondText(w, r, "test ok")
}
