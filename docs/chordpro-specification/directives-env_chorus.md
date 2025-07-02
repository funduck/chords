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

Directives: start\_of\_chorus
=============================

Abbreviation: `soc`.

This directive indicates that the lines that follow form the song's
chorus. These lines are normal song lines, but will be shown in an
outstanding manner.

This directive may include an optional label, to identify the chorus.
For example:,

    {start_of_chorus: Chorus 2}

The ChordPro reference implementation prints the label in the left
margin, see
[labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels).

Directives: end\_of\_chorus
===========================

Abbreviation: `eoc`.

This directive indicates the end of the chorus.

Directives: chorus
==================

This directive indicates that the song chorus must be played here.

Examples:

    {chorus}
    {chorus: Final}

In the second form, the argument is used as a label for the chorus.

If multiple choruses are defined in a song, `{chorus}` applies to the
last definition that precedes this directive.

See also:
[labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels),
[Chorus style](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#chorus-style).
