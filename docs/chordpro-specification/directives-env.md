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

Environment directives
======================

Environments, also called *sections*, group series of input lines into
meaningful units. For example, one of the most used environments is
`chorus`, to indicate the chorus of a song.

Environments start with a `start_of` directive, e.g.
`{start_of_chorus}`, and end with a corresponding `end_of` directive,
e.g. `{end_of_chorus}`. As with every ChordPro directive, these
directives should be alone on a line.

You can choose arbitrary names for sections as long as the names only
consists of letters, digits and underscores. Environments `chorus`,
`tab`, and `grid` get a predefined special treatment.

Implementations are free to add special treatment to specific
environments, but unknown (unhandled) environments should always be
treated as part of the song lyrics.

All environment directives may include an optional
[label](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels)
to identify the section. For example:,

    {start_of_verse: label="Verse 1"}

For backward compatibility, this also works:

    {start_of_verse: Verse 1}

The label text may contain `\n` sequences to produce multi--line labels:

    {start_of_verse: label="Verse 1\nAll"}

For legacy reasons, the following environments have a short directive to
start and end them:

-   [start\_of\_chorus](./directives-env_chorus.md)
    (short: soc)
-   [end\_of\_chorus](./directives-env_chorus.md)
    (short: eoc)
-   [start\_of\_verse](./directives-env_verse.md)
    (short: sov)
-   [end\_of\_verse](./directives-env_verse.md)
    (short: eov)
-   [start\_of\_bridge](./directives-env_bridge.md)
    (short: sob)
-   [end\_of\_bridge](./directives-env_bridge.md)
    (short: eob)
-   [start\_of\_tab](./directives-env_tab.md)
    (short: sot)
-   [end\_of\_tab](./directives-env_tab.md)
    (short: eot)
-   [start\_of\_grid](./directives-env_grid.md)
    (short: sog)
-   [end\_of\_grid](./directives-env_grid.md)
    (short: eog)
