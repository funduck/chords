# Chordpro Specification
## Chords
The lyrics of the song are interspersed with chords written between brackets [ and ].

## Directives
Besides lyrics with chords, the ChordPro file contains directives, lines that start with { and end with }.
[Full spec](../../../docs/chordpro-specification/chordpro-directives.md)

## Comments
All lines that start with a # are ignored.

## Markup
It is possible to use markup in lyrics and other texts to change the way how these will be typeset. Markup is written in tags, each tag starts with < and ends with >.

# Parsing Chordpro Files
## Markup
For now we should ignore markup.
## Directive in the middle
If { is found in the middle of a line, the line is split into two parts: the part before { and the part after {.
The part before { is considered to be a line of lyrics, the part after { is considered to be a directive.