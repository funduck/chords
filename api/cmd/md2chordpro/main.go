package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
)

type Song struct {
	Title  string
	Artist string
	Lines  []string
}

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: %s <input.md> [output.pro]\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "Converts markdown files with chords to ChordPro format\n")
		fmt.Fprintf(os.Stderr, "Example: %s song.md song.pro\n", os.Args[0])
		os.Exit(1)
	}

	inputFile := os.Args[1]
	outputFile := inputFile
	if strings.HasSuffix(outputFile, ".md") {
		outputFile = strings.TrimSuffix(outputFile, ".md") + ".pro"
	} else {
		outputFile += ".pro"
	}

	if len(os.Args) >= 3 {
		outputFile = os.Args[2]
	}

	song, err := parseMarkdownFile(inputFile)
	if err != nil {
		log.Fatalf("Error parsing file: %v", err)
	}

	err = writeChordProFile(outputFile, song)
	if err != nil {
		log.Fatalf("Error writing file: %v", err)
	}

	fmt.Printf("Converted %s to %s\n", inputFile, outputFile)
}

func parseMarkdownFile(filename string) (*Song, error) {
	file, err := os.Open(filename)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	song := &Song{}
	scanner := bufio.NewScanner(file)
	inSongContent := false

	// Regex patterns
	titlePattern := regexp.MustCompile(`^(.+)\s*-\s*(.+):\s*аккорды\s*$`)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "<!--") {
			continue
		}

		// Extract title and artist
		if matches := titlePattern.FindStringSubmatch(line); matches != nil {
			song.Artist = strings.TrimSpace(matches[1])
			song.Title = strings.TrimSpace(matches[2])
			continue
		}

		// Start of song content (look for <code> tag)
		if strings.Contains(line, "<code>") {
			inSongContent = true
			continue
		}

		// End of song content
		if strings.Contains(line, "</code>") {
			inSongContent = false
			break
		}

		// Skip HTML tags but not their content
		if strings.HasPrefix(line, "<") && !inSongContent {
			continue
		}

		// Process song content
		if inSongContent && song.Title != "" {
			// Skip lines that look like HTML table remnants
			if strings.Contains(line, "Подобрать аккорды") ||
				strings.Contains(line, "Тональность") ||
				strings.Contains(line, "Размер шрифта") {
				break
			}

			song.Lines = append(song.Lines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, err
	}

	return song, nil
}

func writeChordProFile(filename string, song *Song) error {
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := bufio.NewWriter(file)
	defer writer.Flush()

	// Write metadata
	if song.Title != "" {
		fmt.Fprintf(writer, "{title: %s}\n", song.Title)
	}
	if song.Artist != "" {
		fmt.Fprintf(writer, "{artist: %s}\n", song.Artist)
	}

	fmt.Fprintln(writer)

	// Process song lines
	inChorus := false
	processed := make(map[int]bool) // Track which lines have been processed

	for i, line := range song.Lines {
		line = strings.TrimSpace(line)

		// Skip if this line was already processed as part of a chord-lyric pair
		if processed[i] {
			continue
		}

		if line == "" {
			fmt.Fprintln(writer)
			continue
		}

		// Check for chorus markers
		if strings.Contains(strings.ToLower(line), "припев") {
			if inChorus {
				fmt.Fprintln(writer, "{end_of_chorus}")
				inChorus = false
			}
			fmt.Fprintln(writer, "{start_of_chorus}")
			inChorus = true
			continue
		}

		// Check if this is a lyric line followed by chords (reverse case)
		if !isChordOnlyLine(line) && !strings.Contains(strings.ToLower(line), "припев") {
			// Look ahead to see if the next line is chords
			if i+1 < len(song.Lines) {
				nextLine := strings.TrimSpace(song.Lines[i+1])
				if isChordOnlyLine(nextLine) {
					// This is a lyric line followed by chords - combine them
					convertedLine := mergeChordAndLyricLines(nextLine, line)
					if convertedLine != "" {
						fmt.Fprintln(writer, convertedLine)
					}
					processed[i+1] = true // Mark the chord line as processed
					continue
				}
			}
		}

		// Check if this is a chord line followed by lyrics
		if isChordOnlyLine(line) {
			// Look for the next non-empty line as lyrics
			for j := i + 1; j < len(song.Lines); j++ {
				nextLine := strings.TrimSpace(song.Lines[j])
				if nextLine == "" {
					continue
				}
				if !isChordOnlyLine(nextLine) && !strings.Contains(strings.ToLower(nextLine), "припев") {
					convertedLine := mergeChordAndLyricLines(line, nextLine)
					if convertedLine != "" {
						fmt.Fprintln(writer, convertedLine)
					}
					processed[j] = true // Mark the lyrics line as processed
					break
				}
				break
			}
			continue
		}

		// Check if this line might have inline chords and lyrics
		if containsChords(line) && containsLyrics(line) {
			convertedLine := convertInlineChordLine(line)
			if convertedLine != "" {
				fmt.Fprintln(writer, convertedLine)
			}
			continue
		}

		// Regular lyric line
		fmt.Fprintln(writer, line)
	}

	// Close any open chorus
	if inChorus {
		fmt.Fprintln(writer, "{end_of_chorus}")
	}

	return nil
}

func isChordOnlyLine(line string) bool {
	// Remove whitespace and check if line contains only chord-like patterns
	trimmed := strings.TrimSpace(line)
	if trimmed == "" {
		return false
	}

	// Split by whitespace and check each part
	parts := strings.Fields(trimmed)
	for _, part := range parts {
		if !isChord(part) {
			return false
		}
	}
	return len(parts) > 0
}

func isChord(s string) bool {
	// Basic chord pattern: starts with A-G, optional #/b, optional m, optional numbers
	chordPattern := regexp.MustCompile(`^[A-G][#b]?[m]?[0-9]*$`)
	return chordPattern.MatchString(s)
}

func containsChords(line string) bool {
	parts := strings.Fields(line)
	for _, part := range parts {
		if isChord(part) {
			return true
		}
	}
	return false
}

func containsLyrics(line string) bool {
	// Check if line contains Cyrillic characters (Russian lyrics)
	cyrillicPattern := regexp.MustCompile(`[а-яё]`)
	return cyrillicPattern.MatchString(strings.ToLower(line))
}

func mergeChordAndLyricLines(chordLine, lyricLine string) string {
	chords := strings.Fields(chordLine)
	if len(chords) == 0 {
		return lyricLine
	}

	// Get chord positions based on their actual positions in the chord line
	chordPositions := getChordPositions(chordLine)

	// Convert lyric line to runes for proper character handling
	lyrics := []rune(lyricLine)
	result := ""

	lastPos := 0
	for i, pos := range chordPositions {
		if i >= len(chords) {
			break
		}

		// Add lyrics from last position to current chord position
		endPos := pos
		if endPos > len(lyrics) {
			endPos = len(lyrics)
		}

		// Add the text before the chord
		if endPos > lastPos {
			result += string(lyrics[lastPos:endPos])
		}

		// Add the chord
		result += "[" + chords[i] + "]"

		lastPos = endPos
	}

	// Add remaining lyrics
	if lastPos < len(lyrics) {
		result += string(lyrics[lastPos:])
	}

	return result
}

func getChordPositions(chordLine string) []int {
	positions := []int{}
	inChord := false
	currentPos := 0

	for _, char := range chordLine {
		if char == ' ' || char == '\t' {
			if inChord {
				inChord = false
			}
			if char == '\t' {
				currentPos += 4 // Treat tab as 4 spaces
			} else {
				currentPos++
			}
		} else {
			if !inChord {
				// Start of a new chord
				positions = append(positions, currentPos)
				inChord = true
			}
			currentPos++
		}
	}

	return positions
}

func convertInlineChordLine(line string) string {
	// For lines that mix chords and lyrics, try to separate them
	words := strings.Fields(line)
	result := ""

	for _, word := range words {
		if isChord(word) {
			result += "[" + word + "]"
		} else {
			result += word + " "
		}
	}

	return strings.TrimSpace(result)
}
