package app

import (
	"net/http"

	"chords.com/api/internal/auth"
	eventbus "chords.com/api/internal/event_bus"
	"chords.com/api/internal/logger"
	"github.com/gorilla/websocket"
)

func (a *App) NewWSHandler() http.HandlerFunc {
	log := logger.NewForModule("ws")

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		accessToken, err := auth.GetAccessToken(r.Context())
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte("Unauthorized"))
			conn.Close()
			return
		}

		log.Infow("WebSocket connection established",
			"userID", accessToken.UserID,
			"isAnonymous", accessToken.IsAnonymous,
		)

		client := eventbus.NewClient(eventbus.ClientIDFromUint(accessToken.UserID))
		a.eventBus.Register(client)
		defer func() {
			a.eventBus.Unregister(client)
			conn.Close()
		}()

		// Writer goroutine
		go func() {
			for event := range client.SendChan {
				log.Debugw("Sending event to user",
					"userID", accessToken.UserID,
					"eventType", event.Type,
					"eventData", event.Data,
				)
				conn.WriteJSON(event)
			}
		}()

		// Read loop (optional: handle incoming messages)
		for {
			messageType, bytes, err := conn.ReadMessage()
			if err != nil {
				break
			}
			// Optionally handle incoming messages here
			log.Debugw("Received message from user",
				"userID", accessToken.UserID,
				"messageType", messageType,
				"message", string(bytes),
			)
		}
		close(client.SendChan)

		log.Infow("WebSocket connection closed",
			"userID", accessToken.UserID,
			"reason", "client disconnected",
		)
	}
}
