package app

import (
	"encoding/json"
	"net/http"

	"chords.com/api/internal/auth"
	eventbus "chords.com/api/internal/event_bus"
	"chords.com/api/internal/logger"
	"github.com/gorilla/websocket"
)

func (a *App) NewWSHandler() http.HandlerFunc {
	var log = logger.NewForModule("ws")

	var upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}

	return func(w http.ResponseWriter, r *http.Request) {
		accessTokenStr := r.URL.Query().Get("state")
		accessToken, err := auth.ParseAccessToken(w, accessTokenStr)
		if err != nil {
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return
		}

		log.Infow("WebSocket connection established",
			"userID", accessToken.UserID,
			"isAnonymous", accessToken.IsAnonymous,
		)

		bus := eventbus.GetEventBus()

		client := eventbus.NewClient(accessToken.UserID)
		bus.Register(client)
		defer func() {
			bus.Unregister(client)
			conn.Close()
		}()

		// Writer goroutine
		go func() {
			for event := range client.SendChan {
				log.Debugw("Sending event to user",
					"userID", accessToken.UserID,
					"event", event,
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

			event := eventbus.Event{}
			if err := json.Unmarshal(bytes, &event); err != nil {
				log.Errorw("Failed to unmarshal event",
					"userID", accessToken.UserID,
					"error", err,
				)
				continue
			} else {
				bus.OnClientEvent(accessToken.UserID, &event)
			}

		}
		close(client.SendChan)

		log.Infow("WebSocket connection closed",
			"userID", accessToken.UserID,
			"reason", "client disconnected",
		)
	}
}

// PostWSHandler godoc
// @Summary Post WebSocket Handler
// @Description This is a placeholder - only for OpenAPI documentation purposes.
// @Tags WebSocket
// @Accept json
// @Produce json
// @Param data body eventbus.Event true "Request body"
// @Success 200 {object} eventbus.Event "WebSocket event"
// @Router /ws [post]
// @Security BearerAuth
func (a *App) PostWSHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}
