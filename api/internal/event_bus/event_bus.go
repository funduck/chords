package eventbus

import (
	"sync"

	"chords.com/api/internal/logger"
)

type Event struct {
	Origin  uint        `json:"origin"`            // ID of the client that originated the event
	Context string      `json:"context,omitempty"` // Optional context for the event, client specific
	Type    string      `json:"type"`              // Client specific event type
	Data    interface{} `json:"data"`              // Client specific event data
}

type Client struct {
	ID        uint
	SendChan  chan *Event
	Listeners map[string]func(*Event) // Optional: for handling events
}

func NewClient(id uint) *Client {
	return &Client{
		ID:       uint(id),
		SendChan: make(chan *Event, 8), // Buffered channel to prevent blocking
	}
}

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
		log:     logger.NewForModule("EventBus"),
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
}

func (bus *EventBus) Unregister(client *Client) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	delete(bus.clients, client.ID)
}

func (bus *EventBus) Broadcast(event *Event) {
	if event == nil {
		return
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()
	for clientID := range bus.clients {
		if event.Origin == clientID {
			continue // Avoid sending the event back to the origin
		}
		bus.log.Debugw("Broadcasting event to client",
			"clientID", clientID,
			"event", event,
		)
		select {
		case bus.clients[clientID].SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}

func (bus *EventBus) SendToClient(clientID uint, event *Event) {
	if event == nil {
		return
	}
	if event.Origin == clientID {
		return // Avoid sending the event back to the origin
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		bus.log.Debugw("Sending event to client",
			"clientID", clientID,
			"event", event,
		)
		select {
		case client.SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}

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

func (bus *EventBus) AddClientListener(clientID uint, name string, listener func(*Event)) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		if client.Listeners == nil {
			client.Listeners = make(map[string]func(*Event))
		}
		client.Listeners[name] = listener // Use a default listener key
	}
}

func (bus *EventBus) RemoveClientListener(clientID uint, listenerKey string) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		if client.Listeners != nil {
			delete(client.Listeners, listenerKey)
		}
	}
}

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
		if client.Listeners != nil {
			for _, listener := range client.Listeners {
				listener(event)
			}
		}
	}
}
