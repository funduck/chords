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

Directives: start\_of\_tab
==========================

Abbreviation: `sot`.

This directive indicates that the lines that follow form a section of
guitar TAB instructions. The lines will not be folded or changed. Markup
is left as is, and directives are considered literal text except for
`{end_of_tab}` and `{eot}`.

This directive may include an optional label, to be printed in the left
margin. For example:,

    {start_of_tab: Solo}

The ChordPro reference implementation prints the label in the left
margin, see
[labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels).

Directives: end\_of\_tab
========================

Abbreviation: `eot`.

This directive indicates the end of the tab.
