![](../images/chordpro-icon.png) [ChordPro](https://www.chordpro.org/chordpro/home/)

The Specification

<a href="https://www.chordpro.org/chordpro/chordpro-introduction/" class="list-group-item list-group-item-action bg-light">Overview</a> <a href="https://www.chordpro.org/chordpro/chordpro-directives/" class="list-group-item list-group-item-action bg-light">ChordPro Directives</a> <a href="https://www.chordpro.org/chordpro/chordpro-chords/" class="list-group-item list-group-item-action bg-light">ChordPro Chords</a>

The Program

<a href="https://www.chordpro.org/chordpro/chordpro-reference-implementation/" class="list-group-item list-group-item-action bg-light">Overview</a> <a href="https://www.chordpro.org/chordpro/chordpro-installation/" class="list-group-item list-group-item-action bg-light">Installation</a> <a href="https://www.chordpro.org/chordpro/chordpro-getting-started/" class="list-group-item list-group-item-action bg-light">Getting Started</a> <a href="https://www.chordpro.org/chordpro/chordpro-configuration/" class="list-group-item list-group-item-action bg-light">Configuration</a> <a href="https://www.chordpro.org/chordpro/using-chordpro/" class="list-group-item list-group-item-action bg-light">CLI User guide</a>

Support

<a href="https://www.chordpro.org/chordpro/support/" class="list-group-item list-group-item-action bg-light">Forum, Hints and FAQ</a> <a href="https://www.chordpro.org/chordpro/links/" class="list-group-item list-group-item-action bg-light">Links</a> <a href="https://www.chordpro.org/chordpro/roadmap/" class="list-group-item list-group-item-action bg-light">ROADMAP</a> <a href="https://www.chordpro.org/chordpro/allpages/" class="list-group-item list-group-item-action bg-light">All Pages</a>

Toggle Sidebar

<span class="navbar-toggler-icon"></span>

-   <a href="https://www.chordpro.org/chordpro/" class="nav-link">ChordPro Home</a>

Directives: transpose
=====================

`{transpose:` *value* `}`

This directive indicates that the remainder of the song should be transposed the number of semitones according to the given *value*. When used at the beginning of a song, the whole song will be transposed. When used somewhere in the song it can be used to achieve modulation.

If transposing results in accidentals, a positive value will use sharps, while a negative value will use flats.

For example:

    [C]A song [D] line with [E]chords   [F]
`    {transpose: 2}`
    [C]A song [D] line with [E]chords   [F]

This will print:

    C      D         E       F 
    A song line with chords
    D      E         F#      G
    A song line with chords

As can be seen above, transposing `E` with the (positive) value 2 results in `F#`. Transposing with the (negative) value -10 will result in the enharmonic equivalent chord `G♭`:

    [C]A song [D] line with [E]chords   [F]
`    {transpose: -10}`
    [C]A song [D] line with [E]chords   [F]

This will print:

    C      D         E       F 
    A song line with chords
    D      E         Gb      G
    A song line with chords

A `{transpose}` directive without a value will cancel the current transposition, possibly restoring a preceding transposition.

`transpose` and the `key` metadata
----------------------------------

The transpose directive is effective from where it appears in the ChordPro file. It will not affect a `key` directive that precedes it.

If a song has a key, a metadata item `key_actual` is automatically added and contains the actual key including transpositions. If a transposition is in effect, there is also an item `key_from` that contains the actual key *before* the transposition.
