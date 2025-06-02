package app

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

func (a *App) NewWSHandler() http.HandlerFunc {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}
		defer conn.Close()

		for {
			mt, message, err := conn.ReadMessage()
			if err != nil {
				break
			}
			response := fmt.Sprintf("Received: %s", message)
			// Echo the message back
			if err := conn.WriteMessage(mt, []byte(response)); err != nil {
				break
			}
		}
	}
}
