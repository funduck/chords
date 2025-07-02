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

Directives: key
===============

This directive specifies the key the song is written in. Multiple key
specifications are possible, each specification is assumed to apply from
where it was specified.

Examples:

    {key: C}
    {meta: key C}

Note that if a
[capo](./directives-capo.md) setting is in
effect, the key does not change. This is because guitar players consider
the key relative to the chord shapes they play. The actual key as
perceived by the listener (sounding key, concert key) *will* be modified
according to the capo settings.

For example:

    {key: C}
    {capo: 2}

Now the key for the player is still `C`, but the key for fellow
musicians and listeners is `D`.

Metadata item `_key` reflects the key as transposed by the capo value.
It cannot be set with a directive but it is automatically provided by
ChordPro, and can be used in [title and comment
texts](https://www.chordpro.org/chordpro/chordpro-configuration-format-strings/).

See also: [capo](./directives-capo.md),
[meta](./directives-meta.md) and
[transpose](./directives-transpose.md).
