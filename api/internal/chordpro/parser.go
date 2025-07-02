package chordpro

import (
	"regexp"
	"strings"
)

type Parser struct {
	chordRegex     *regexp.Regexp
	directiveRegex *regexp.Regexp
}

func NewParser() *Parser {
	return &Parser{
		chordRegex:     regexp.MustCompile(`\[([^\]]*)\]`),
		directiveRegex: regexp.MustCompile(`\{([^}]*)\}`),
	}
}

func (p *Parser) Parse(content string) (*Song, error) {
	song := &Song{
		Sections: []Section{},
	}

	lines := strings.Split(content, "\n")
	currentSection := Section{Type: "verse", Lines: []Line{}}

	for _, line := range lines {
		line = strings.TrimSpace(line)

		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Check for directive in the middle of line
		if strings.Contains(line, "{") && !strings.HasPrefix(line, "{") {
			parts := strings.SplitN(line, "{", 2)
			// Process lyrics part
			if strings.TrimSpace(parts[0]) != "" {
				parsedLine := p.parseLyricsLine(parts[0])
				currentSection.Lines = append(currentSection.Lines, parsedLine)
			}
			// Process directive part
			directiveLine := "{" + parts[1]
			p.processDirective(directiveLine, song, &currentSection)
		} else if strings.HasPrefix(line, "{") {
			// Handle directive
			p.processDirective(line, song, &currentSection)
		} else {
			// Handle lyrics line
			parsedLine := p.parseLyricsLine(line)
			currentSection.Lines = append(currentSection.Lines, parsedLine)
		}
	}

	// Add the last section if it has content
	if len(currentSection.Lines) > 0 {
		song.Sections = append(song.Sections, currentSection)
	}

	return song, nil
}

func (p *Parser) processDirective(line string, song *Song, currentSection *Section) {
	matches := p.directiveRegex.FindStringSubmatch(line)
	if len(matches) < 2 {
		return
	}

	directive := strings.TrimSpace(matches[1])
	parts := strings.SplitN(directive, ":", 2)

	key := strings.TrimSpace(parts[0])
	value := ""
	if len(parts) > 1 {
		value = strings.TrimSpace(parts[1])
	}

	switch strings.ToLower(key) {
	case "title", "t":
		song.Title = value
	case "subtitle", "st":
		song.Subtitle = value
	case "artist":
		song.Artist = value
	case "album":
		song.Album = value
	case "key":
		song.Key = value
	case "capo":
		song.Capo = value
	case "tempo":
		song.Tempo = value
	case "start_of_chorus", "soc":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "chorus", Lines: []Line{}}
	case "end_of_chorus", "eoc":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "verse", Lines: []Line{}}
	case "start_of_verse", "sov":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "verse", Lines: []Line{}}
	case "end_of_verse", "eov":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "verse", Lines: []Line{}}
	case "start_of_bridge", "sob":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "bridge", Lines: []Line{}}
	case "end_of_bridge", "eob":
		p.finishCurrentSection(song, currentSection)
		*currentSection = Section{Type: "verse", Lines: []Line{}}
	}
}

func (p *Parser) finishCurrentSection(song *Song, currentSection *Section) {
	if len(currentSection.Lines) > 0 {
		song.Sections = append(song.Sections, *currentSection)
	}
}

func (p *Parser) parseLyricsLine(line string) Line {
	chords := []Chord{}
	text := line

	// Find all chord positions
	matches := p.chordRegex.FindAllStringSubmatch(line, -1)
	indices := p.chordRegex.FindAllStringIndex(line, -1)

	if len(matches) > 0 {
		// Remove chords from text and calculate positions
		offset := 0
		for i, match := range matches {
			chordName := match[1]
			startPos := indices[i][0] - offset
			endPos := indices[i][1] - offset

			// Add chord with position in the cleaned text
			chords = append(chords, Chord{
				Name:     chordName,
				Position: startPos,
			})

			// Remove the chord from text
			text = text[:indices[i][0]-offset] + text[indices[i][1]-offset:]
			offset += endPos - startPos
		}
	}

	return Line{
		Text:   text,
		Chords: chords,
	}
}
