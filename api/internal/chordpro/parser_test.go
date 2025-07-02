package chordpro

import (
	"testing"
)

func TestParser_Parse(t *testing.T) {
	parser := NewParser()

	t.Run("basic song with metadata", func(t *testing.T) {
		content := `{title: Amazing Grace}
{artist: John Newton}
{key: G}

Amazing [G]grace how [C]sweet the [G]sound
That saved a [D]wretch like [G]me`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if song.Title != "Amazing Grace" {
			t.Errorf("Expected title 'Amazing Grace', got '%s'", song.Title)
		}
		if song.Artist != "John Newton" {
			t.Errorf("Expected artist 'John Newton', got '%s'", song.Artist)
		}
		if song.Key != "G" {
			t.Errorf("Expected key 'G', got '%s'", song.Key)
		}

		if len(song.Sections) != 1 {
			t.Fatalf("Expected 1 section, got %d", len(song.Sections))
		}

		section := song.Sections[0]
		if section.Type != "verse" {
			t.Errorf("Expected section type 'verse', got '%s'", section.Type)
		}

		if len(section.Lines) != 2 {
			t.Fatalf("Expected 2 lines, got %d", len(section.Lines))
		}

		// Test first line
		line1 := section.Lines[0]
		if line1.Text != "Amazing grace how sweet the sound" {
			t.Errorf("Expected text 'Amazing grace how sweet the sound', got '%s'", line1.Text)
		}
		if len(line1.Chords) != 3 {
			t.Fatalf("Expected 3 chords, got %d", len(line1.Chords))
		}
		if line1.Chords[0].Name != "G" || line1.Chords[0].Position != 8 {
			t.Errorf("Expected chord G at position 8, got %s at %d", line1.Chords[0].Name, line1.Chords[0].Position)
		}
	})

	t.Run("chorus and verse sections", func(t *testing.T) {
		content := `{title: Test Song}

{start_of_verse}
This is a [C]verse
{end_of_verse}

{start_of_chorus}
This is the [G]chorus
{end_of_chorus}`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if len(song.Sections) != 2 {
			t.Fatalf("Expected 2 sections, got %d", len(song.Sections))
		}

		if song.Sections[0].Type != "verse" {
			t.Errorf("Expected first section to be 'verse', got '%s'", song.Sections[0].Type)
		}
		if song.Sections[1].Type != "chorus" {
			t.Errorf("Expected second section to be 'chorus', got '%s'", song.Sections[1].Type)
		}
	})

	t.Run("directive in middle of line", func(t *testing.T) {
		content := `Amazing [G]grace {title: Amazing Grace}
How sweet the sound`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if song.Title != "Amazing Grace" {
			t.Errorf("Expected title 'Amazing Grace', got '%s'", song.Title)
		}

		if len(song.Sections) != 1 {
			t.Fatalf("Expected 1 section, got %d", len(song.Sections))
		}

		section := song.Sections[0]
		if len(section.Lines) != 2 {
			t.Fatalf("Expected 2 lines, got %d", len(section.Lines))
		}

		line1 := section.Lines[0]
		if line1.Text != "Amazing grace " {
			t.Errorf("Expected text 'Amazing grace ', got '%s'", line1.Text)
		}
		if len(line1.Chords) != 1 || line1.Chords[0].Name != "G" {
			t.Errorf("Expected chord G, got %v", line1.Chords)
		}
	})

	t.Run("comments are ignored", func(t *testing.T) {
		content := `{title: Test}
# This is a comment
Amazing [G]grace
# Another comment
How sweet the sound`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if len(song.Sections) != 1 {
			t.Fatalf("Expected 1 section, got %d", len(song.Sections))
		}

		section := song.Sections[0]
		if len(section.Lines) != 2 {
			t.Fatalf("Expected 2 lines, got %d", len(section.Lines))
		}
	})

	t.Run("empty chords", func(t *testing.T) {
		content := `Amazing []grace with [Am]chord`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		section := song.Sections[0]
		line := section.Lines[0]

		if len(line.Chords) != 2 {
			t.Fatalf("Expected 2 chords, got %d", len(line.Chords))
		}

		if line.Chords[0].Name != "" {
			t.Errorf("Expected empty chord name, got '%s'", line.Chords[0].Name)
		}
		if line.Chords[1].Name != "Am" {
			t.Errorf("Expected chord 'Am', got '%s'", line.Chords[1].Name)
		}
	})

	t.Run("all metadata fields", func(t *testing.T) {
		content := `{title: Test Song}
{subtitle: A Test}
{artist: Test Artist}
{album: Test Album}
{key: C}
{capo: 2}
{tempo: 120}

Test line`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if song.Title != "Test Song" {
			t.Errorf("Expected title 'Test Song', got '%s'", song.Title)
		}
		if song.Subtitle != "A Test" {
			t.Errorf("Expected subtitle 'A Test', got '%s'", song.Subtitle)
		}
		if song.Artist != "Test Artist" {
			t.Errorf("Expected artist 'Test Artist', got '%s'", song.Artist)
		}
		if song.Album != "Test Album" {
			t.Errorf("Expected album 'Test Album', got '%s'", song.Album)
		}
		if song.Key != "C" {
			t.Errorf("Expected key 'C', got '%s'", song.Key)
		}
		if song.Capo != "2" {
			t.Errorf("Expected capo '2', got '%s'", song.Capo)
		}
		if song.Tempo != "120" {
			t.Errorf("Expected tempo '120', got '%s'", song.Tempo)
		}
	})

	t.Run("short directive forms", func(t *testing.T) {
		content := `{t: Short Title}
{st: Short Subtitle}
{soc}
Chorus line
{eoc}
{sov}
Verse line
{eov}`

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if song.Title != "Short Title" {
			t.Errorf("Expected title 'Short Title', got '%s'", song.Title)
		}
		if song.Subtitle != "Short Subtitle" {
			t.Errorf("Expected subtitle 'Short Subtitle', got '%s'", song.Subtitle)
		}

		if len(song.Sections) != 2 {
			t.Fatalf("Expected 2 sections, got %d", len(song.Sections))
		}

		if song.Sections[0].Type != "chorus" {
			t.Errorf("Expected first section to be 'chorus', got '%s'", song.Sections[0].Type)
		}
		if song.Sections[1].Type != "verse" {
			t.Errorf("Expected second section to be 'verse', got '%s'", song.Sections[1].Type)
		}
	})

	t.Run("empty content", func(t *testing.T) {
		content := ""

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if len(song.Sections) != 0 {
			t.Errorf("Expected 0 sections for empty content, got %d", len(song.Sections))
		}
	})

	t.Run("only whitespace and comments", func(t *testing.T) {
		content := `
# Just a comment
   
# Another comment
   `

		song, err := parser.Parse(content)
		if err != nil {
			t.Fatalf("Parse failed: %v", err)
		}

		if len(song.Sections) != 0 {
			t.Errorf("Expected 0 sections for whitespace/comments only, got %d", len(song.Sections))
		}
	})
}

func TestParser_parseLyricsLine(t *testing.T) {
	parser := NewParser()

	t.Run("line with multiple chords", func(t *testing.T) {
		line := parser.parseLyricsLine("Amazing [G]grace how [C]sweet the [G]sound")

		expectedText := "Amazing grace how sweet the sound"
		if line.Text != expectedText {
			t.Errorf("Expected text '%s', got '%s'", expectedText, line.Text)
		}

		if len(line.Chords) != 3 {
			t.Fatalf("Expected 3 chords, got %d", len(line.Chords))
		}

		expectedChords := []Chord{
			{Name: "G", Position: 8},
			{Name: "C", Position: 17},
			{Name: "G", Position: 27},
		}

		for i, expected := range expectedChords {
			if line.Chords[i].Name != expected.Name {
				t.Errorf("Chord %d: expected name '%s', got '%s'", i, expected.Name, line.Chords[i].Name)
			}
			if line.Chords[i].Position != expected.Position {
				t.Errorf("Chord %d: expected position %d, got %d", i, expected.Position, line.Chords[i].Position)
			}
		}
	})

	t.Run("line with no chords", func(t *testing.T) {
		line := parser.parseLyricsLine("Just plain text")

		if line.Text != "Just plain text" {
			t.Errorf("Expected text 'Just plain text', got '%s'", line.Text)
		}
		if len(line.Chords) != 0 {
			t.Errorf("Expected 0 chords, got %d", len(line.Chords))
		}
	})
}
