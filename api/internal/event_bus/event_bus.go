package eventbus

import (
	"fmt"
	"sync"
)

type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type ClientID string

func ClientIDFromUint(id uint) ClientID {
	return ClientID(fmt.Sprintf("%d", id))
}

type Client struct {
	ID       ClientID
	SendChan chan Event
}

func NewClient(id ClientID) *Client {
	return &Client{
		ID:       id,
		SendChan: make(chan Event, 8), // Buffered channel to prevent blocking
	}
}

type EventBus struct {
	clients map[ClientID]*Client
	mu      sync.Mutex
}

func NewEventBus() *EventBus {
	return &EventBus{
		clients: make(map[ClientID]*Client),
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

func (bus *EventBus) Broadcast(event Event) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	for clientID := range bus.clients {
		select {
		case bus.clients[clientID].SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}

func (bus *EventBus) SendToClient(clientID ClientID, event Event) {
	bus.mu.Lock()
	defer bus.mu.Unlock()
	if client, exists := bus.clients[clientID]; exists {
		select {
		case client.SendChan <- event:
		default:
			// Drop if buffer is full
		}
	}
}
