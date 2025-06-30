package service

import (
	"fmt"
	"regexp"
	"strings"

	"chords.com/api/internal/dto"
	"chords.com/api/internal/entity"
)

type ChordProService struct{}

func NewChordProService() *ChordProService {
	return &ChordProService{}
}

// Use regex to extract {title: ...} and {artist: ...}
var titleRe = regexp.MustCompile(`(?i)\{title:\s*([^\}]*)\}`)
var artistRe = regexp.MustCompile(`(?i)\{artist:\s*([^\}]*)\}`)

func (s *ChordProService) ParseChordPro(sheet string) (*dto.SongInfo, error) {
	songInfo := &dto.SongInfo{
		Format: entity.SheetFormat_Chordpro,
	}

	if m := titleRe.FindStringSubmatch(sheet); m != nil {
		songInfo.Title = strings.TrimSpace(m[1])
	} else {
		return nil, fmt.Errorf("failed to parse title from chordpro sheet")
	}
	if m := artistRe.FindStringSubmatch(sheet); m != nil {
		songInfo.Artist = strings.TrimSpace(m[1])
	} else {
		return nil, fmt.Errorf("failed to parse artist from chordpro sheet")
	}

	return songInfo, nil
}
