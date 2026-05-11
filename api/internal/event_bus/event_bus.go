package eventbus

import (
	"sync"

	"chords.com/api/internal/logger"
)

/*
EventBus is an internal event router.
It enables several patterns: fan-out,
*/
type EventBus struct {
	clients map[uint]*Client
	mu      sync.Mutex
	log     logger.Logger
}

var instance *EventBus

func GetEventBus() *EventBus {
	if instance == nil {
		instance = NewEventBus()
	}
	return instance
}

func NewEventBus() *EventBus {
	return &EventBus{
		clients: make(map[uint]*Client),
		log:     logger.NewForModule("eventbus"),
	}
}

func (bus *EventBus) Register(client *Client) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	// TODO: Add device id to client because now one user can have only 1 client
	prevClient, exists := bus.clients[client.ID]
	if exists {
		bus.log.Warnw("Client already registered, replacing",
			"clientID", client.ID,
			"prevClientID", prevClient.ID,
		)
		client.SendChan = prevClient.SendChan   // Preserve send channel from previous client
		client.Listeners = prevClient.Listeners // Preserve listeners from previous client
	}
	bus.clients[client.ID] = client
	bus.log.Debugw("Client registered",
		"clientID", client.ID,
		"sendChanSize", len(client.SendChan),
		"listeners", len(client.Listeners),
	)
}

func (bus *EventBus) Unregister(client *Client) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	delete(bus.clients, client.ID)
}

/*
SendToClients sends event to particular clients if they are connected right now.
Origin client is skipped.
*/
func (bus *EventBus) SendToClients(clientIDs []uint, event *Event) {
	if event == nil {
		return
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()

	for _, clientID := range clientIDs {
		if event.Origin == clientID {
			continue // Avoid sending the event back to the origin
		}
		bus.log.Debugw("Sending event to multiple clients",
			"clientID", clientID,
			"event", event,
		)
		if client, exists := bus.clients[clientID]; exists {
			select {
			case client.SendChan <- event:
			default:
				// Drop if buffer is full
			}
		}
	}
}

/*
Adds listener to events emitted by particular client.
So this listener() will be invoked on every event from the client.
Listener key is required for removing the listener.
*/
func (bus *EventBus) AddClientListener(clientID uint, listenerKey string, listener func(*Event)) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		if client.Listeners == nil {
			client.Listeners = make(map[string]func(*Event))
		}
		client.Listeners[listenerKey] = listener // Use a default listener key
		bus.log.Debugw("Added listener for client",
			"clientID", clientID,
			"listenerKey", listenerKey,
			"listenersCount", len(client.Listeners),
		)
	} else {
		bus.log.Infow("Client not found for adding listener",
			"clientID", clientID,
			"listenerKey", listenerKey,
		)
	}
}

/*
RemoveClientListener removes particular listener from client.
*/
func (bus *EventBus) RemoveClientListener(clientID uint, listenerKey string) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		if client.Listeners != nil {
			delete(client.Listeners, listenerKey)
			bus.log.Debugw("Removed listener for client",
				"clientID", clientID,
				"listenerKey", listenerKey,
				"listenersCount", len(client.Listeners),
			)
		}
	}
}

/*
OnClientEvent pushes event to all client listeners.
*/
func (bus *EventBus) OnClientEvent(clientID uint, event *Event) {
	if event == nil {
		return
	}
	if event.Origin == 0 {
		event.Origin = clientID
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		if len(client.Listeners) > 0 {
			for _, listener := range client.Listeners {
				listener(event)
			}
		} else {
			bus.log.Debugw("No listeners for client",
				"clientID", clientID,
				"event", event,
			)
		}
	} else {
		bus.log.Warnw("Client not found for event",
			"clientID", clientID,
			"event", event,
		)
	}
}
