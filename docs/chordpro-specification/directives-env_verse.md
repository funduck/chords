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

Directives: start\_of\_verse
============================

Abbreviation: `sov`.

Specifies that the following lines form a verse of the song.

Lines that are outside any `start_of_…`/`end_of_…` part will also be
interpreted as song lines in a verse, but it may be advantageous to
explicitly specify it.

This directive may include an optional label to identify the section.

    {start_of_verse: Verse 1}

To be future proof it is advised to use *key*`=`*value* syntax:

    {start_of_verse: label="Verse 1"}

The ChordPro reference implementation prints the label in the left
margin, see
[labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels).

Directives: end\_of\_verse
==========================

Abbreviation: `eov`.

Specifies the end of the verse.
