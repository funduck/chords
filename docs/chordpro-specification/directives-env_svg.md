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

Directives: start\_of\_svg
==========================

This directive indicates that the lines that follow define an image
described in [Scalable Vector Graphics](https://...).

For example

    {start_of_svg}
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <g stroke="red" fill="none" stroke-width="2">
        <polygon points="1 17 19 17 10 1" stroke-linejoin="round"/>
        <rect x="9" y="13" width="2" height="2" stroke="none" fill="red"/>
        <polygon points="9 12 8.5 7 11.5 7 11 12" stroke="none" fill="red"/>
      </g>
    </svg>
    {end_of_svg}

The result could look like:

![](../images/ex_svg1.png){.img-responsive .img-fluid}

Attributes
----------

The SVG directive may contain the same formatting attributes as the
image directive, for example:

    {start_of_svg label="Alert" align="left"}

See [Directives:
Image](./directives-image.md) for all
possible attributes.

Directives: end\_of\_svg
========================

This directive indicates the end of the svg section.
