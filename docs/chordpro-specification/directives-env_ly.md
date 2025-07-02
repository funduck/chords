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

Directives: start\_of\_ly
=========================

**EXPERIMENTAL**

This directive indicates that the lines that follow define a piece of
music written in [Lilypond](https://lilypond.org).

For example

    {start_of_ly}
    \relative { g'8\( a b[ c b\) a] g4 }
    {end_of_ly}

The result could look like:

![](../images/ex_ly1.png){.img-responsive .img-fluid}

**Important** To render Lilypond, ChordPro makes use of external tools
to convert the Lilypond source to an SVG image, and then embeds the
image. Depending on the external tools support for embedded Lilypond may
be limited, or absent.

This directive may include an optional label, to be printed in the left
margin. For example:,

    {start_of_ly: Intro}

The ChordPro reference implementation prints the label in the left
margin, see
[labels](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#labels).

General rules for embedding Lilypond source
-------------------------------------------

-   A default `\version` directive will be prepended, although it is
    always better to provide your own. See `"preamble"` in the Lilypond
    section of `"delegates"` in the config.

-   To prevent large (full-page) images, printing the Lilypond tag line
    is suppressed by prepending

        \header { tagline = ##f }

-   ChordPro transposition using `{transpose}` or `--transpose` will
    **not transpose** the embedded Lilypond. This is hopefully a
    temporary restriction. Adding `\transpose` to the Lilypond source
    will work as usual, affecting the Lilypond notes only.

-   The Lilypond data is converted and included as a single image. No
    vertical splitting between systems.

-   The LilyPond data must start with a line that starts with a percent
    `%` sign or backslash `\`. Anything before this line will be
    considered formatting instructions (see below).

Since the actual rendering is handled by external tools, ChordPro has no
control over what and how the output will look like.

Formatting instructions
-----------------------

The Lilypond data may be preceded by formatting instructions:

-   scale=*n*\
    Scale the image with the given factor.

-   center\
    Center the image on the page.

Directives: end\_of\_ly
=======================

This directive indicates the end of the Lilypond section.
