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

Directives: meta
================

This directive defines a meta-data item.

`{meta: `*name*` `*value*`}`

Sets meta-data item *name* to the specified contents. *name* must be a single word but may include underscores.

Meta-data names can be chosen freely although single lowercase words like `artist` and `composer` are advised. It is left to the ChordPro file processing tools to do something sensible with the meta-data.

For convenience and backward compatibility, the following meta-data are considered standard. They can be defined using the `meta` directive, but also as standalone directives: [title](./directives-title.md), [sorttitle](./directives-sorttitle.md), [subtitle](./directives-subtitle.md), [artist](./directives-artist.md), [composer](./directives-composer.md), [lyricist](./directives-lyricist.md), [arranger](./directives-arranger.md), [copyright](./directives-copyright.md), [album](./directives-album.md), [year](./directives-year.md), [key](./directives-key.md), [time](./directives-time.md), [tempo](./directives-tempo.md), [duration](./directives-duration.md) and [capo](./directives-capo.md).

Examples:

`    {meta: artist The Beatles}`

Multiple values can be set by multiple meta-directives. For example:

`    {meta: composer John Lennon}`
`    {meta: composer Paul McCartney}`

See also [autosplit](https://www.chordpro.org/chordpro/chordpro-configuration-generic/#metadata).

See also [Using metadata in texts](https://www.chordpro.org/chordpro/chordpro-configuration-format-strings/).
