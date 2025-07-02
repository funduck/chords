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

Directives: start\_of\_chorus
=============================

Abbreviation: `soc`.

This directive indicates that the lines that follow form the song’s chorus. These lines are normal song lines, but will be shown in an outstanding manner.

This directive may include an optional label, to identify the chorus. For example:,

`    {start_of_chorus: Chorus 2}`

The ChordPro reference implementation prints the label in the left margin, see [labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels).

Directives: end\_of\_chorus
===========================

Abbreviation: `eoc`.

This directive indicates the end of the chorus.

Directives: chorus
==================

This directive indicates that the song chorus must be played here.

Examples:

`    {chorus}`
`    {chorus: Final}`

In the second form, the argument is used as a label for the chorus.

If multiple choruses are defined in a song, `{chorus}` applies to the last definition that precedes this directive.

See also: [labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels), [Chorus style](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#chorus-style).
