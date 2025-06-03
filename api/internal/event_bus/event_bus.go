package eventbus

import (
	"sync"

	"github.com/google/uuid"
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
	}
}

func (bus *EventBus) Register(client *Client) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
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
		if client, exists := bus.clients[id]; exists {
			select {
			case client.SendChan <- event:
			default:
				// Drop if buffer is full
			}
		}
	}
}

func (bus *EventBus) AddClientListener(id uint, listener func(*Event)) string {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[id]; exists {
		if client.Listeners == nil {
			client.Listeners = make(map[string]func(*Event))
		}
		listenerKey := uuid.New().String()       // Generate a unique key for the listener
		client.Listeners[listenerKey] = listener // Use a default listener key
		return listenerKey
	}
	return ""
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
