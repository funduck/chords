![](../images/chordpro-icon.png) [ChordPro](https://www.chordpro.org/chordpro/home/)

The Specification

<a href="https://www.chordpro.org/chordpro/chordpro-introduction/" class="list-group-item list-group-item-action bg-light">Overview</a> <a href="index.html" class="list-group-item list-group-item-action bg-light">ChordPro Directives</a> <a href="https://www.chordpro.org/chordpro/chordpro-chords/" class="list-group-item list-group-item-action bg-light">ChordPro Chords</a>

The Program

<a href="https://www.chordpro.org/chordpro/chordpro-reference-implementation/" class="list-group-item list-group-item-action bg-light">Overview</a> <a href="https://www.chordpro.org/chordpro/chordpro-installation/" class="list-group-item list-group-item-action bg-light">Installation</a> <a href="https://www.chordpro.org/chordpro/chordpro-getting-started/" class="list-group-item list-group-item-action bg-light">Getting Started</a> <a href="https://www.chordpro.org/chordpro/chordpro-configuration/" class="list-group-item list-group-item-action bg-light">Configuration</a> <a href="https://www.chordpro.org/chordpro/using-chordpro/" class="list-group-item list-group-item-action bg-light">CLI User guide</a>

Support

<a href="https://www.chordpro.org/chordpro/support/" class="list-group-item list-group-item-action bg-light">Forum, Hints and FAQ</a> <a href="https://www.chordpro.org/chordpro/links/" class="list-group-item list-group-item-action bg-light">Links</a> <a href="https://www.chordpro.org/chordpro/roadmap/" class="list-group-item list-group-item-action bg-light">ROADMAP</a> <a href="https://www.chordpro.org/chordpro/allpages/" class="list-group-item list-group-item-action bg-light">All Pages</a>

Toggle Sidebar

<span class="navbar-toggler-icon"></span>

-   <a href="https://www.chordpro.org/chordpro/" class="nav-link">ChordPro Home</a>

ChordPro directives
===================

ChordPro directives are used to control the appearance of the printed output. They define meta-data like titles, add new chords, control page and column breaks. Therefore it is not always easy to make a distinction between the semantics of a directive, and the way these semantics are implemented in the ChordPro processing program, the *formatter*.

For example, the `title` directive.

`    {title: Swing Low Sweet Chariot}`

The directive *name* is ‘title’, and its *argument* is the text ‘Swing Low Sweet Chariot’. This directive defines meta-data, the song title. That is the semantic part. What the formatter does with this meta-data is up to the program and *not part of the ChordPro File Format Specification*. You can consider directives to be a friendly request, or suggestion, but the actual implementation is left to the formatter. For a meta-data item like the song title it will probably be printed on top of the page and be included in a table of contents, if any.

The [Chordpro Program](https://www.chordpro.org/chordpro/chordpro-reference-implementation/) provides a default implementation in the style of the original `chord` program. It can be used as a reference to what a directive is assumed to do. It must however be emphasised that program can be configured to use different page styles, fonts, sizes, colours, and so on. Where appropriate, this document refers to the default style.

Many directives have long and short names. For example, the long (full) name for the directive `title` is ‘title’, and the short (abbreviated) name is ‘t’. It is, however, advised to use the full name whenever possible, since the abbreviations may lead to confusion or ambiguity if new directives are added.

### Arguments and attributes

For directives that take arguments, the arguments are separated from the directive name by a colon `:` and/or whitespace, as can be seen above with the `title` directive. Some directives require more than a single argument. For these, a syntax familiar to HTML attributes is used, e.g.

`    {image: src="myimage.jpg" scale="50%"}`

You can use pairs of single and pairs of double quotes, the result is the same.

Some directives with a single argument will also take an attribute instead. For example, the following variants of `start_of_verse` are the same:

`    {start_of_verse Verse 1}`
`    {start_of_verse label="Verse 1"}`

It is always best to use the variant with explicit attributes. It is less confusing, robust, and future-proof.

Note: In this documentation *attributes* are often denoted with the less correct term *properties*. This will be straightened out in the future.

Preamble directives
-------------------

-   [new\_song](./directives-new_song.md) (short: ns)

Meta-data directives
--------------------

Each song can have meta-data associated, for example the song title. Meta-data are mostly used by programs that help organizing collections of ChordPro songs.

-   [title](./directives-title.md) (short: t)
-   [sorttitle](./directives-sorttitle.md)
-   [subtitle](./directives-subtitle.md) (short: st)
-   [artist](./directives-artist.md)
-   [composer](./directives-composer.md)
-   [lyricist](./directives-lyricist.md)
-   [copyright](./directives-copyright.md)
-   [album](./directives-album.md)
-   [year](./directives-year.md)
-   [key](./directives-key.md)
-   [time](./directives-time.md)
-   [tempo](./directives-tempo.md)
-   [duration](./directives-duration.md)
-   [capo](./directives-capo.md)
-   [meta](./directives-meta.md)

See also [Using metadata in texts](https://www.chordpro.org/chordpro/chordpro-configuration-format-strings/).

Formatting directives
---------------------

-   [comment](./directives-comment.md) (short: c)
-   [highlight](./directives-comment.md)
-   [comment\_italic](./directives-comment.md) (short: ci)
-   [comment\_box](./directives-comment.md) (short: cb)
-   [image](./directives-image.md)

Environment directives
----------------------

Environment directives always come in pairs, one to start the environment and one to end it.

-   [Introduction to environments](./directives-env.md)
-   [start\_of\_chorus](./directives-env_chorus.md) (short: soc), [end\_of\_chorus](./directives-env_chorus.md) (short: eoc)
-   [chorus](./directives-env_chorus.md)
-   [start\_of\_verse](./directives-env_verse.md) (short: sov), [end\_of\_verse](./directives-env_verse.md) (short: eov)
-   [start\_of\_bridge](./directives-env_bridge.md) (short: sob), [end\_of\_bridge](./directives-env_bridge.md) (short: eob)
-   [start\_of\_tab](./directives-env_tab.md) (short: sot), [end\_of\_tab](./directives-env_tab.md) (short: eot)
-   [start\_of\_grid](./directives-env_grid.md) (short: sog), [end\_of\_grid](./directives-env_grid.md) (short: eog)

Delegated environment directives
--------------------------------

These environment directives turn their content into something else, usually an image, and embed the result in the ChordPro output.

-   [Introduction to delegated environments](./directives-delegates.md)
-   [start\_of\_abc](./directives-env_abc.md) / [end\_of\_abc](./directives-env_abc.md)
-   [start\_of\_ly](./directives-env_ly.md) / [end\_of\_ly](./directives-env_ly.md)
-   [start\_of\_svg](./directives-env_svg.md) / [end\_of\_svg](./directives-env_svg.md)
-   [start\_of\_textblock](./directives-env_textblock.md) / [end\_of\_textblock](./directives-env_textblock.md)

Chord diagrams
--------------

-   [define](./directives-define.md)
-   [chord](./directives-chord.md)

Transposition
-------------

-   [transpose](./directives-transpose.md)

Fonts, sizes and colours
------------------------

These directives can be used to temporarily change the font, size and/or colour for lyrics, chords, and more. To permanently change these the reference implementation uses much more powerful [configuration files](https://www.chordpro.org/chordpro/chordpro-configuration/).

-   [chordfont](./directives-props_chord_legacy.md) (short: cf), [chordsize](./directives-props_chord_legacy.md) (short: cs), [chordcolour](./directives-props_chord_legacy.md)
-   [chorusfont](./directives-props_chorus_legacy.md), [chorussize](./directives-props_chorus_legacy.md), [choruscolour](./directives-props_chorus_legacy.md)
-   [footerfont](./directives-props_footer_legacy.md), [footersize](./directives-props_footer_legacy.md), [footercolour](./directives-props_footer_legacy.md)
-   [gridfont](./directives-props_grid_legacy.md), [gridsize](./directives-props_grid_legacy.md), [gridcolour](./directives-props_grid_legacy.md)
-   [tabfont](./directives-props_tab_legacy.md), [tabsize](./directives-props_tab_legacy.md), [tabcolour](./directives-props_tab_legacy.md)
-   [labelfont](./directives-props_label_legacy.md), [labelsize](./directives-props_label_legacy.md), [labelcolour](./directives-props_label_legacy.md)
-   [tocfont](./directives-props_toc_legacy.md), [tocsize](./directives-props_toc_legacy.md), [toccolour](./directives-props_toc_legacy.md)
-   [textfont](./directives-props_text_legacy.md) (short: tf), [textsize](./directives-props_text_legacy.md) (short: ts), [textcolour](./directives-props_text_legacy.md)
-   [titlefont](./directives-props_title_legacy.md), [titlesize](./directives-props_title_legacy.md), [titlecolour](./directives-props_title_legacy.md)

Output related directives
-------------------------

-   [new\_page](./directives-new_page.md) (short: np)
-   [new\_physical\_page](./directives-new_physical_page.md) (short: npp)
-   [column\_break](./directives-column_break.md) (short: colb)
-   [pagetype](./directives-pagetype_legacy.md)

The following directives are legacy from the old `chord` program. The modern reference implementation uses much more powerful configuration files for this purpose.

-   [diagrams](./directives-diagrams.md)
-   [grid](./directives-grid_legacy.md) (short: g)
-   [no\_grid](./directives-grid_legacy.md) (short: ng)
-   [titles](./directives-titles_legacy.md)
-   [columns](./directives-columns.md) (short: col)

Custom extensions
-----------------

To facilitate using custom extensions for application specific purposes, any directive with a name starting with `x_` should be completely ignored by applications that do not handle this directive. In particular, no warning should be generated when an unsupported `x_`directive is encountered.

It is advised to follow the `x_` prefix by a tag that identifies the application (namespace). For example, a directive to control a specific pedal setting for the MobileSheetsPro program could be named `x_mspro_pedal_setting`.

Conditional directives
======================

All directives can be conditionally selected by postfixing the directive with a dash (hyphen) and a *selector*.

If a selector is used, ChordPro first tries to match it with the instrument type (as defined in the [config file](https://www.chordpro.org/chordpro/chordpro-configuration-generic/#instrument-description)). If this fails, it tries to match it with the user name (as defined in the [config file](https://www.chordpro.org/chordpro/chordpro-configuration-generic/#user)). Finally, it will try it as a meta item, selection will succeed if this item exists and has a ’true’ value (i.e., not empty, zero, `false` or `null`). Selection can be reversed by appending a `!` to the selector.

For example, to define chords depending on the instrument used:

```
`{define-guitar:  Am base-fret 1 frets 0 2 2 1 0 0}`
`{define-ukulele: Am base-fret 1 frets 2 0 0 0}`
```

An example of comments depending on voices:

```
`{comment-alto:  Very softly!}`
`{comment-tenor: Sing this with power}`
```

When used with sections, selection applies to *everything* in the section, up to and including the final section end directive:

```
`{start_of_verse-soprano}`
...anything goes, including other directives...
`{end_of_verse}`
```

Note that the section end must **not** include the selector.
