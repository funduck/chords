package eventbus

import (
	"testing"
	"time"

	"chords.com/api/internal/config"
)

func TestEventBus(t *testing.T) {
	config.InitForTest()

	t.Run("Register", func(t *testing.T) {
		bus := NewEventBus()
		client := NewClient(1)
		bus.Register(client)
		defer bus.Unregister(client)

		event := Event{
			Type: "test_event",
			Data: "test_data",
		}
		bus.Broadcast(&event)

		select {
		case got := <-client.SendChan:
			if got != &event {
				t.Errorf("expected %v, got %v", event, got)
			}
		case <-time.After(time.Second):
			t.Error("timeout waiting for event")
		}
	})

	t.Run("Unregister", func(t *testing.T) {
		bus := NewEventBus()
		client := NewClient(1)
		bus.Register(client)
		bus.Unregister(client)

		event := Event{
			Type: "test_event",
			Data: "test_data",
		}
		bus.Broadcast(&event)

		select {
		case <-client.SendChan:
			t.Error("received event after unregister")
		case <-time.After(100 * time.Millisecond):
			// success
		}
	})

	t.Run("On Client Event", func(t *testing.T) {
		bus := NewEventBus()
		client := NewClient(1)
		bus.Register(client)
		defer bus.Unregister(client)

		event := Event{
			Type: "test_event",
			Data: "test_data",
		}
		bus.AddClientListener(client.ID, func(e *Event) {
			if e.Type != event.Type || e.Data != event.Data {
				t.Errorf("expected %v, got %v", event, e)
			}
		},
		)

		bus.OnClientEvent(client.ID, &event)
	})

}
