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

Directives: start\_of\_textblock
================================

This directive indicates that the lines that follow define a piece of
text that is combined into a single object that can be placed as an
image.

For example

    {start_of_textblock align=right flush=right}
    She died of the fever,
    and nothing could save her
    And that was the end of sweet Molly Malone
    {end_of_textblock}

The result could look like:

![](../images/ex_textblock1.png){.img-responsive .img-fluid}

(The text at the left are ordinary chords and lyrics.)

Attributes
----------

The textblock directive may contain the same formatting attributes as
the image directive, for example:

    {start_of_textblock label="Verse 2" align="left"}

See [Directives:
Image](./directives-image.md) for all
possible attributes.

Additionally, the following attributes may be used:

-   `width="`*n*`"`\
    The width of the resultant object.\
    Defaults to the actual width (tight fit) of the texts.\
    Note that the object can only be made wider, not smaller.

-   `height="`*n*`"`\
    The height of the resultant object.\
    Defaults to the actual height of the text, including the advance of
    the last line (non-tight fit).\
    Note that the object can only be made higher, not smaller.\
    When `height` or `padding` is set, a tight fit is used.

-   `padding="`*n*`"`\
    Provides padding between the object and the inner text.\
    When height or padding is set, a tight fit is used.

-   `flush="`*flush*`"`\
    Horizontal text flush (`left`, `center`, `right`).

-   `vflush="`*vflush*`"`\
    Vertical text flush (`top`, `middle`, `bottom`).

-   `textstyle="`*style*`"`\
    Style (font) to be used. Must be one of the printable items as
    defined in the
    [config](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#fonts).\
    Default style is `text`.

-   `textsize="`*n*`"`\
    Initial value for the text size. This may be relative to the size
    specified in the config using `%`, `em`, and `ex`.

-   `textcolor="`*colour*`"`\
    Initial value for the text colour.

-   `background="`*colour*`"`\
    The background color of the object.

-   `omit="`*b*`"`\
    If true, the delegate is ignored.
