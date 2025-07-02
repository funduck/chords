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

Directives: capo
================

This directive specifies the [capo](https://en.wikipedia.org/wiki/Capo)
setting for the song.

Examples:

    {capo: 2}
    {meta: capo 2}

Note that if a capo setting is in effect, the
[key](./directives-key.md) of the song
does not change. This is because guitar players consider the key
relative to the chord shapes they play. The actual key as perceived by
the listener (sounding key, concert key) *will* be modified according to
the capo settings.

For example:

    {key: C}
    {capo: 2}

Now the key for the player is still `C`, but the key for fellow
musicians and listeners is `D`.

See also: [key](./directives-key.md) and
[meta](./directives-meta.md).
