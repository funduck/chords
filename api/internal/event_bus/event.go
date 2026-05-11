package eventbus

type Event struct {
	Origin  uint        `json:"origin"`            // ID of the client that produced the event
	Context string      `json:"context,omitempty"` // Optional context for the event, client specific
	Type    string      `json:"type"`              // Client specific event type
	Data    interface{} `json:"data"`              // Client specific event data
}
