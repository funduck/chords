package chordpro

type Song struct {
	Title    string    `json:"title"`
	Subtitle string    `json:"subtitle"`
	Artist   string    `json:"artist"`
	Album    string    `json:"album,omitempty"`
	Key      string    `json:"key,omitempty"`
	Capo     string    `json:"capo,omitempty"`
	Tempo    string    `json:"tempo,omitempty"`
	Sections []Section `json:"sections"`
}

type Section struct {
	Type  string `json:"type"` // verse, chorus, bridge, etc.
	Lines []Line `json:"lines"`
}

type Line struct {
	Text   string  `json:"text"`
	Chords []Chord `json:"chords,omitempty"`
}

type Chord struct {
	Name     string `json:"name"`
	Position int    `json:"position"`
}
