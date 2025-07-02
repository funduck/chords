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

Environment directives
======================

Environments, also called *sections*, group series of input lines into meaningful units. For example, one of the most used environments is `chorus`, to indicate the chorus of a song.

Environments start with a `start_of` directive, e.g. `{start_of_chorus}`, and end with a corresponding `end_of` directive, e.g. `{end_of_chorus}`. As with every ChordPro directive, these directives should be alone on a line.

You can choose arbitrary names for sections as long as the names only consists of letters, digits and underscores. Environments `chorus`, `tab`, and `grid` get a predefined special treatment.

Implementations are free to add special treatment to specific environments, but unknown (unhandled) environments should always be treated as part of the song lyrics.

All environment directives may include an optional [label](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels) to identify the section. For example:,

`    {start_of_verse: label="Verse 1"}`

For backward compatibility, this also works:

`    {start_of_verse: Verse 1}`

The label text may contain `\n` sequences to produce multi–line labels:

`    {start_of_verse: label="Verse 1\nAll"}`

For legacy reasons, the following environments have a short directive to start and end them:

-   [start\_of\_chorus](./directives-env_chorus.md) (short: soc)
-   [end\_of\_chorus](./directives-env_chorus.md) (short: eoc)
-   [start\_of\_verse](./directives-env_verse.md) (short: sov)
-   [end\_of\_verse](./directives-env_verse.md) (short: eov)
-   [start\_of\_bridge](./directives-env_bridge.md) (short: sob)
-   [end\_of\_bridge](./directives-env_bridge.md) (short: eob)
-   [start\_of\_tab](./directives-env_tab.md) (short: sot)
-   [end\_of\_tab](./directives-env_tab.md) (short: eot)
-   [start\_of\_grid](./directives-env_grid.md) (short: sog)
-   [end\_of\_grid](./directives-env_grid.md) (short: eog)
