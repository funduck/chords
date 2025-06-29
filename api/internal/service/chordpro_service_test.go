package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestChordproService(t *testing.T) {
	svc := NewChordProService()

	t.Run("Parse title and artist", func(t *testing.T) {
		sheet := `
{title: Blowin' In  The Wind}
{artist: Bob Dylan}
{subtitle: }
{soh}
Instrumental
The [C] answer, my [D7] friend, is [G] blowin’ in the [Em] wind,
The [C] answer is [D7] blowin’ in the [G] wind.
{eoh}

[G] How many [C] roads must a [G] man walk down
Before you [C] call him a [D] man? [D7]
[G] How many [C] seas must a [G] white dove [Em] sail
Be-[G]-fore she [C] sleeps in the [D] sand? [D7]

[G] How many [C] times must the [G] cannonballs fly
Before they’re for-[C]ever [D] banned? [D7]
The [C] answer, my [D7] friend, is [G] blowin’ in the [Em] wind,
The [C] answer is [D7] blowin’ in the [G] wind.

[G] How many [C] times must a [G] man look up
Before he can [C] see the [D] sky? [D7]
[G] How many [C] ears must [G] one man [Em] have
Be-[G]-fore he can [C] hear people [D] cry? [D7]

[G] How many [C] deaths will it [G] take ‘til he knows that
Too many [C] people have [D] died? [D7]
The [C] answer, my [D7] friend, is [G] blowin’ in the [Em] wind,
The [C] answer is [D7] blowin’ in the [G] wind.

[G] How many [C] years can a [G] mountain exist
Before it is [C] washed to the [D] sea? [D7]
[G] How many [C] years can some [G] people ex-[Em]ist
Be-[G]-fore they’re a-[C]llowed to be [D] free? [D7]

[G] How many [C] times can a [G] man turn his head and
Pretend that he [C] just doesn’t [D] see?  [D7]
The [C] answer, my [D7] friend, is [G] blowin’ in the [Em] wind,
The [C] answer is [D7] blowin’ in the [G] wind.

The [C] answer, my [D7] friend, is [G] blowin’ in the [Em] wind,
The [C] answer is [D7] blowin’ in the [G] wind.
`

		songInfo, err := svc.ParseChordPro(sheet)

		assert.NoError(t, err)
		assert.NotNil(t, songInfo)
		assert.Equal(t, "Blowin' In  The Wind", songInfo.Title)
		assert.Equal(t, "Bob Dylan", songInfo.Artist)
	})

}
