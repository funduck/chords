package dto

type SearchArtistRequest struct {
	Query        string `json:"query"`
	CursorAfter  string `json:"cursor_after"`
	CursorBefore string `json:"cursor_before"`
	Limit        int    `json:"limit" validate:"min=1,max=100"`
	ReturnRows   bool   `json:"return_rows" default:"true"`
	ReturnTotal  bool   `json:"return_total" default:"true"`
}
