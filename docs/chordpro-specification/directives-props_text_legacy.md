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

Directives: textfont, textsize, textcolour
==========================================

Note: If the intention is to change the appearance for the whole song, or collection of songs, it is much better to use [configuration files](https://www.chordpro.org/chordpro/chordpro-configuration/) instead.

`    {textfont: serif}`
`    {textsize: 12}`
`    {textcolour: blue}`

These directives change the font, size and colour of the song lyrics that follow.

The font must be a [known font family](https://www.chordpro.org/chordpro/chordpro-fonts/), or the name of a file containing a TrueType or OpenType font.

The size must be a valid number like `12` or `10.5`, or a percentage like `120%`. If a percentage is given, it is taken relative to the current value for the size.

The colour must be a [known colour](https://www.chordpro.org/chordpro/chordpro-colours/), or a hexadecimal colour code like `#4491ff`.

`    {textfont}`
`    {textsize}`
`    {textcolour}`

Change the font, size and colour of the song lyrics that follow back to the previous (or default) value.

Example:

    I [D]looked over Jordan, and [G]what did I [D]see,
`    {textcolour: red}`
`    {textsize: 150%}`
    Comin’ for to carry me [A7]home.
`    {textcolour}`
`    {textsize}`
    A [D]band of angels [G]comin’ after [D]me,

Assuming default settings, all lyrics lines will be printed in black except the second line that will be bigger and red.

<img src="../images/ex_textcolour.png" class="img-responsive img-fluid" />

Relation with chorusfont, chorussize, and choruscolour
------------------------------------------------------

The chorus properties depend on the text settings. If you change e.g. text colour with `{textcolour blue}` this will also affect the colour of the chorus lyrics. To change a chorus property and a text property, first change the text property, and then the chorus property.

This will make the chorus lyrics red, and all other lyrics blue:

`    {textcolour blue}`
`    {choruscolour red}`

But this will make all lyrics blue, including the chorus:

`    {choruscolour red}`
`    {textcolour blue}`
