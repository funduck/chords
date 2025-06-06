package eventbus

import (
	"sync"

	"chords.com/api/internal/logger"
)

type Event struct {
	Origin uint        `json:"origin"`
	Type   string      `json:"type"`
	Data   interface{} `json:"data"`
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
	for id := range bus.clients {
		if event.Origin == id {
			continue // Avoid sending the event back to the origin
		}
		bus.log.Debugw("Broadcasting event to client",
			"clientID", id,
			"eventType", event.Type,
			"eventData", event.Data,
		)
		select {
		case bus.clients[id].SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}

func (bus *EventBus) SendToClient(id uint, event *Event) {
	if event == nil {
		return
	}
	if event.Origin == id {
		return // Avoid sending the event back to the origin
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[id]; exists {
		bus.log.Debugw("Sending event to client",
			"clientID", id,
			"eventType", event.Type,
			"eventData", event.Data,
		)
		select {
		case client.SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}

func (bus *EventBus) SendToClients(ids []uint, event *Event) {
	if event == nil {
		return
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()

	for _, id := range ids {
		if event.Origin == id {
			continue // Avoid sending the event back to the origin
		}
		bus.log.Debugw("Sending event to multiple clients",
			"clientID", id,
			"eventType", event.Type,
			"eventData", event.Data,
		)
		if client, exists := bus.clients[id]; exists {
			select {
			case client.SendChan <- event:
			default:
				// Drop if buffer is full
			}
		}
	}
}

func (bus *EventBus) AddClientListener(id uint, name string, listener func(*Event)) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[id]; exists {
		if client.Listeners == nil {
			client.Listeners = make(map[string]func(*Event))
		}
		client.Listeners[name] = listener // Use a default listener key
	}
}

func (bus *EventBus) RemoveClientListener(id uint, listenerKey string) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[id]; exists {
		if client.Listeners != nil {
			delete(client.Listeners, listenerKey)
		}
	}
}

func (bus *EventBus) OnClientEvent(id uint, event *Event) {
	if event == nil {
		return
	}
	if event.Origin == 0 {
		event.Origin = id
	}
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[id]; exists {
		if client.Listeners != nil {
			for _, listener := range client.Listeners {
				listener(event)
			}
		}
	}
}
