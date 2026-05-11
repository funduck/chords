package eventbus

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
