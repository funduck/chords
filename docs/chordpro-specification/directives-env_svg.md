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

Directives: start\_of\_svg
==========================

This directive indicates that the lines that follow define an image described in [Scalable Vector Graphics](https://...).

For example

`    {start_of_svg}`
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18">
      <g stroke="red" fill="none" stroke-width="2">
        <polygon points="1 17 19 17 10 1" stroke-linejoin="round"/>
        <rect x="9" y="13" width="2" height="2" stroke="none" fill="red"/>
        <polygon points="9 12 8.5 7 11.5 7 11 12" stroke="none" fill="red"/>
      </g>
    </svg>
`    {end_of_svg}`

The result could look like:

<img src="../images/ex_svg1.png" class="img-responsive img-fluid" />

Attributes
----------

The SVG directive may contain the same formatting attributes as the image directive, for example:

`    {start_of_svg label="Alert" align="left"}`

See [Directives: Image](./directives-image.md) for all possible attributes.

Directives: end\_of\_svg
========================

This directive indicates the end of the svg section.
