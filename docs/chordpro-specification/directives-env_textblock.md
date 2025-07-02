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

Directives: start\_of\_textblock
================================

This directive indicates that the lines that follow define a piece of text that is combined into a single object that can be placed as an image.

For example

`    {start_of_textblock align=right flush=right}`
    She died of the fever,
    and nothing could save her
    And that was the end of sweet Molly Malone
`    {end_of_textblock}`

The result could look like:

<img src="../images/ex_textblock1.png" class="img-responsive img-fluid" />

(The text at the left are ordinary chords and lyrics.)

Attributes
----------

The textblock directive may contain the same formatting attributes as the image directive, for example:

`    {start_of_textblock label="Verse 2" align="left"}`

See [Directives: Image](./directives-image.md) for all possible attributes.

Additionally, the following attributes may be used:

-   `width="`*n*`"`  
    The width of the resultant object.  
    Defaults to the actual width (tight fit) of the texts.  
    Note that the object can only be made wider, not smaller.

-   `height="`*n*`"`  
    The height of the resultant object.  
    Defaults to the actual height of the text, including the advance of the last line (non-tight fit).  
    Note that the object can only be made higher, not smaller.  
    When `height` or `padding` is set, a tight fit is used.

-   `padding="`*n*`"`  
    Provides padding between the object and the inner text.  
    When height or padding is set, a tight fit is used.

-   `flush="`*flush*`"`  
    Horizontal text flush (`left`, `center`, `right`).

-   `vflush="`*vflush*`"`  
    Vertical text flush (`top`, `middle`, `bottom`).

-   `textstyle="`*style*`"`  
    Style (font) to be used. Must be one of the printable items as defined in the [config](https://www.chordpro.org/chordpro/chordpro-configuration-pdf/#fonts).  
    Default style is `text`.

-   `textsize="`*n*`"`  
    Initial value for the text size. This may be relative to the size specified in the config using `%`, `em`, and `ex`.

-   `textcolor="`*colour*`"`  
    Initial value for the text colour.

-   `background="`*colour*`"`  
    The background color of the object.

-   `omit="`*b*`"`  
    If true, the delegate is ignored.
