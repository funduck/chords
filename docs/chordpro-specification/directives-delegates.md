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

Delegated environment directives
================================

Delegated environments are similar to ordinary environments.

-   They are extensions to the ChordPro environments and often implemented using external tools or libraries. **Therefore they may not be available in all implementations of ChordPro.**

-   In general, they produce an image that can be placed anywhere in the song.

-   They have their own section in the configuration and can be customized.

Configuration
-------------

Delegated environments are configured in the `delegates` section of the config. For example:

    "delegates" : {
        "textblock" : {
            "type"     : "image",
            "module"   : "TextBlock",
            "handler"  : "txt2xform",
        },
    }

This configures a delegated environment called `textblock` and adds `start_of_textblock` and `end_of_textblock` directives. `module` and `handler` specify the plugin module that handles this environment, and its entry point. You should never need to change these. `type` specifies what the delegated environment produces, usually an `image`.

When `type` is set to `omit`, the environment is parsed but not processed, i.e., it does not produce anything.

When `image` is `none`, there will be no `start_of` and `end_of` directives, effectively removing the delegated environment from ChordPro. As a result, the environment will be treated as a generic environment.

ABC
---

-   [start\_of\_abc](./directives-env_abc.md) / [end\_of\_abc](./directives-env_abc.md)

Lilypond
--------

-   [start\_of\_ly](./directives-env_ly.md) / [end\_of\_ly](./directives-env_ly.md)

SVG
---

-   [start\_of\_svg](./directives-env_svg.md) / [end\_of\_svg](./directives-env_svg.md)

Textblock
---------

-   [start\_of\_textblock](./directives-env_textblock.md) / [end\_of\_textblock](./directives-env_textblock.md)
