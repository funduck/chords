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

Directives: diagrams
====================

`{diagrams}`\
`{diagrams: off}`\
`{diagrams: ` *ctl* `}`

Enables printing of the list of chord diagrams used in the current song.

The `diagrams` directive can take a single argument, either `on`
(default) or `off`, or the position where the diagrams must be placed:
`bottom` (default), `top`, `right` and `below`.

For persistent use this can better be set in the [configuration
files](https://www.chordpro.org/chordpro/chordpro-configuration/).

Diagrams printing is enabled by default, and diagrams are printed on the
bottom of the first page. The `diagrams` directive can be used to modify
printing chord diagrams for the current song when printing the diagrams
has been disabled globally, or to change the position where the diagrams
must be placed.

See also the
[chord](./directives-chord.md) directive.
