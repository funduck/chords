![](../images/chordpro-icon.png)
[ChordPro](https://www.chordpro.org/chordpro/home/)

The Specification

[Overview](https://www.chordpro.org/chordpro/chordpro-introduction/)
[ChordPro Directives](./chordpro-directives.md)
[ChordPro Chords](./chordpro-chords.md)


The Program

[Overview](https://www.chordpro.org/chordpro/chordpro-reference-implementation/)

[Installation](https://www.chordpro.org/chordpro/chordpro-installation/)
[Getting Started](https://www.chordpro.org/chordpro/chordpro-getting-started/)

[Configuration](https://www.chordpro.org/chordpro/chordpro-configuration/)
[CLI User guide](https://www.chordpro.org/chordpro/using-chordpro/)


Support
[Forum, Hints and FAQ](https://www.chordpro.org/chordpro/support/)

[Links](https://www.chordpro.org/chordpro/links/)

[ROADMAP](https://www.chordpro.org/chordpro/roadmap/)
[All Pages](https://www.chordpro.org/chordpro/allpages/)


Toggle Sidebar

-   [ChordPro Home](https://www.chordpro.org/chordpro/){.nav-link}

Directives: transpose
=====================

`{transpose:` *value* `}`

This directive indicates that the remainder of the song should be
transposed the number of semitones according to the given *value*. When
used at the beginning of a song, the whole song will be transposed. When
used somewhere in the song it can be used to achieve modulation.

If transposing results in accidentals, a positive value will use sharps,
while a negative value will use flats.

For example:

    [C]A song [D] line with [E]chords   [F]
    {transpose: 2}
    [C]A song [D] line with [E]chords   [F]

This will print:

    C      D         E       F 
    A song line with chords
    D      E         F#      G
    A song line with chords

As can be seen above, transposing `E` with the (positive) value 2
results in `F#`. Transposing with the (negative) value -10 will result
in the enharmonic equivalent chord `G♭`:

    [C]A song [D] line with [E]chords   [F]
    {transpose: -10}
    [C]A song [D] line with [E]chords   [F]

This will print:

    C      D         E       F 
    A song line with chords
    D      E         Gb      G
    A song line with chords

A `{transpose}` directive without a value will cancel the current
transposition, possibly restoring a preceding transposition.

`transpose` and the `key` metadata
----------------------------------

The transpose directive is effective from where it appears in the
ChordPro file. It will not affect a `key` directive that precedes it.

If a song has a key, a metadata item `key_actual` is automatically added
and contains the actual key including transpositions. If a transposition
is in effect, there is also an item `key_from` that contains the actual
key *before* the transposition.
