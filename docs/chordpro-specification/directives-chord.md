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

Directives: chord
=================

This directive is similar to
[define](./directives-define.md) but it
only displays the chord immediately in the song where the directive
occurs.

`{chord:` *name*`}`\
`{chord:` *name* `base-fret` *offset* `frets` *pos* *pos* ... *pos*`}`\
`{chord:` *name* `base-fret` *offset* `frets` *pos* *pos* ... *pos*
`fingers` *pos* *pos* ... *pos*`}`

*name* is the name to be used for this chord. If the directive is used
to show a known chord the rest of the arguments may be omitted.

See [define](./directives-define.md) for
all possible arguments.

Example:

    {chord: Am}
    {chord: Bes base-fret 1 frets 1 1 3 3 3 1 fingers 1 1 2 3 4 1}
    {chord: As  base-fret 4 frets 1 3 3 2 1 1 fingers 1 3 4 2 1 1}

The resultant chord diagrams are:

![](../images/ex_chord.png){.img-responsive .img-fluid}

See also:
[define](./directives-define.md).
