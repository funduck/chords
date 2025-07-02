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

Directives: meta
================

This directive defines a meta-data item.

`{meta: `*name*` `*value*`}`

Sets meta-data item *name* to the specified contents. *name* must be a
single word but may include underscores.

Meta-data names can be chosen freely although single lowercase words
like `artist` and `composer` are advised. It is left to the ChordPro
file processing tools to do something sensible with the meta-data.

For convenience and backward compatibility, the following meta-data are
considered standard. They can be defined using the `meta` directive, but
also as standalone directives:
[title](./directives-title.md),
[sorttitle](./directives-sorttitle.md),
[subtitle](./directives-subtitle.md),
[artist](./directives-artist.md),
[composer](./directives-composer.md),
[lyricist](./directives-lyricist.md),
[arranger](./directives-arranger.md),
[copyright](./directives-copyright.md),
[album](./directives-album.md),
[year](./directives-year.md),
[key](./directives-key.md),
[time](./directives-time.md),
[tempo](./directives-tempo.md),
[duration](./directives-duration.md) and
[capo](./directives-capo.md).

Examples:

    {meta: artist The Beatles}

Multiple values can be set by multiple meta-directives. For example:

    {meta: composer John Lennon}
    {meta: composer Paul McCartney}

See also
[autosplit](https://www.chordpro.org/chordpro/chordpro-configuration-generic/#metadata).

See also [Using metadata in
texts](https://www.chordpro.org/chordpro/chordpro-configuration-format-strings/).
