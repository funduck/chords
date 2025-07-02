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

Directives: define
==================

-   [Common usage](index.html#common-usage)
    -   [Defining chords for string instruments](index.html#defining-chords-for-string-instruments)
    -   [Defining chords for keyboard instruments](index.html#defining-chords-for-keyboard-instruments)
-   [Advanced usage](index.html#advanced-usage)
    -   [Common use (revisited)](index.html#common-use-revisited)
    -   [Using a boilerplate](index.html#using-a-boilerplate)
    -   [Adjust the appearance of the chord diagram](index.html#adjust-the-appearance-of-the-chord-diagram)
    -   [Change the chord name](index.html#change-the-chord-name)
    -   [Adjust the appearance of the chord name](index.html#adjust-the-appearance-of-the-chord-name)
    -   [Using a boilerplate (revisited)](index.html#using-a-boilerplate-revisited)
    -   [Examples](index.html#examples)
-   [Canonical representations](index.html#canonical-representations)
-   [Formatting](index.html#formatting)

Common usage
------------

See also: [chord](./directives-chord.md).

### Defining chords for string instruments

This directive defines a chord in terms of fret/string positions and, optionally, finger settings.

`{define:` *name* `base-fret` *offset* `frets` *pos* *pos* … *pos*`}`  
`{define:` *name* `base-fret` *offset* `frets` *pos* *pos* … *pos* `fingers` *pos* *pos* … *pos*`}`

A fret position is designated with a number, e.g. 5th position, 7th position, etc, and the number is based on what fret the first finger would naturally lie on depending on where you are on the neck. ([see e.g.](https://www.jazzguitar.be/blog/what-are-guitar-positions/))  
In practice, the term *fret* is often used to indicate *position*, which is unfortunate.

<img src="../images/fretpos.png" class="img-responsive img-fluid" />

In the left diagram the first (topmost) finger is in position 1, it presses the string against fret number 1. The finger positions are, from low to high, x (muted), 3, 2, 3, 1, 0 (open). The corresponding `define` directive is

`    {define: C7 base-fret 1 frets x 3 2 3 1 0}`

In the middle diagram, the first finger is in position 3, it presses the string against fret 3. The finger positions are, from low to high, x, 5, 4, 5, 3, x.

`    {define: D7 base-fret 1 frets x 5 4 5 3 x}`

The right diagram shows the same chord as the middle diagram, but it has been shifted towards the top. The `3` left of the top row indicates that the top row of the diagram is really the row at position 3. This can be obtained by adjusting the value of `base-fret` in the `define` directive:

`    {define: D7 base-fret 3 frets x 3 2 3 1 x}`

The `define` directive details:

`{define:` *name* `base-fret` *offset* `frets` *pos* *pos* … *pos*`}`  
`{define:` *name* `base-fret` *offset* `frets` *pos* *pos* … *pos* `fingers` *pos* *pos* … *pos*`}`

-   *name* is the name to be used for this chord. If it is an already known chord the new definition will overwrite the previous one.

-   `base-fret` *offset* defines the offset for the chord, which is the position of the topmost finger. The offset must be 1 or higher.

    When printing chord diagrams, the top row of the diagram corresponds to the actual row at the indicated position, see the discussion above.

-   `frets` *pos* *pos* … *pos* defines the string positions.  
    Strings are enumerated from left (lowest) to right (highest), as they appear in the chord diagrams.  
    Fret positions are relative to the offset **minus one**, so with `base-fret 1` (the default), the topmost fret position is `1`. With `base-fret 3`, fret position `1` indicates the 3rd position.  
    `0` (zero) denotes an open string. Use `-1`, `N` or `x` to denote a non-sounding string.

-   `fingers` *pos* *pos* … *pos* defines finger settings. This part may be omitted.

    For the `frets` and the `fingers` positions, there must be exactly as many positions as there are strings, which is 6 by default. For the `fingers` positions, values corresponding to open or damped strings are ignored.  
    Finger settings may be numeric (`1` .. `9`) or uppercase letters (`A` .. `Z`). All other values are ignored.

Example:

`    {define: Bes base-fret 1 frets 1 1 3 3 3 1 fingers 1 1 2 3 4 1}`
`    {define: As  base-fret 4 frets 1 3 3 2 1 1 fingers 1 3 4 2 1 1}`

The resultant chord diagrams are:

<img src="../images/ex_define.png" class="img-responsive img-fluid" />

### Defining chords for keyboard instruments

For keyboard chords, only the chord notes relative to the root note must be specified:

`{define:` *name* `keys` *note* … *note*`}`

-   *name* is the name to be used for this chord. If it is an already known chord the new definition will overwrite the previous one.

-   `keys` *note* … *note* defines the keys.  
    Key `0` denotes the root note, `7` is the fifth, `11` dominant seventh, and so on.

    Chords in the root position always start with note `0`. The first inversion starts with `4` (major) or `3` (minor) third. The second inversion starts with the fifth `7`.

Example:

`    {define: D  keys 0 4 7}`
`    {define: D² keys 7 12 16}`

The resultant chord diagrams are:

<img src="../images/ex_define2.png" class="img-responsive img-fluid" />

Note that keys that would exceed the diagram are silently wrapped.

Advanced usage
--------------

### Common use (revisited)

`    {define: A frets 0 0 2 2 2 0 base_fret 1}`

This is the most common use of the define directive. It defines a chord with name `A` and its fret positions. If `A` is a known chord its chord properties (`root`, `qual`, `ext` and `bass`) are used, otherwise these properties are derived from the given name.

You can include the chord in a song by using its name:

    I [A]woke up this morning

### Using a boilerplate

`    {define:` *A* `copy` *B* … `}`

This defines chord *A* and copies the diagram properties (`base_fret`, `frets`, `fingers` and `keys`) from chord *B*, which must be a chord from the config (or earlier definition).

You can (re)define these properties in the define directive.

### Adjust the appearance of the chord diagram

`    {define:` … `diagram off` … `}`

With `diagram off` ChordPro will not include a chord diagram for this chord.

Possible values for `diagram` are `on` and `off`, and the name of a colour. In the latter case the diagram will be shown in the specified colour.

### Change the chord name

`    {define:` *A* … `display` *C* … `}`

This sets the displayed chord name (in song body and diagram) to *C*. To show the chord the chord properties from *C* will be used. Note that to include the chord in your song you still have to use the given name *A*.

### Adjust the appearance of the chord name

`    {define:` … `format` *fmt* … `}`

Defines the format string (see [below](index.html#formatting)) for this chord.

### Using a boilerplate (revisited)

`    {define:` *A* `copyall` *B* … `}`

With `copyall` instead of `copy` the `display` and `format` properties of *B*, if present, are also copied.

### Examples

`    {define: Am7}`

Defines the `Am7` chord. Chord properties are derived from the given name `Am7`:

| name  | root | qual | ext | bass |
|-------|------|------|-----|------|
| `Am7` | `A`  | `m`  | `7` |      |

There are no diagram properties, so no chord diagram will be included in the output.

`    {define: Am7 frets 0 0 2 0 1 0}`

Defines the `Am7` chord. Chord properties are derived from the given name `Am7`. Diagram property `frets` is provided and therefore `base_fret` is implied.

| name  | root | qual | ext | bass | base | frets       |
|-------|------|------|-----|------|------|-------------|
| `Am7` | `A`  | `m`  | `7` |      | 1    | 0 0 2 0 1 0 |

There are usable diagram properties, so a chord diagram will be included in the output.

`    {define: Am7 copy Am7 frets x 0 2 0 1 3}`

Defines a variant of the `Am7` chord. Chord properties are derived from the given name `Am7`. Diagram properties are copied from the existing definition of chord `Am7` and the `frets` property is modified.

| name  | root | qual | ext | bass | base | frets       | fingers     |
|-------|------|------|-----|------|------|-------------|-------------|
| `Am7` | `A`  | `m`  | `7` |      | 1    | x 0 2 0 1 3 | x x 2 3 1 x |
|       |      |      |     |      |      |             |             |

Note that the `fingers` property is copied from the existing definition of chord and therefore does not correspond to the modified fret positions.

Canonical representations
-------------------------

The chord properties have a companion set with `_canon` appended to the property names. These are the *canonical* representations of the properties. In general the canonical version is the same as the corresponding property. They will differ if alternative variants of the properties are used.

For example, for the chord root:

| name  | root  | root\_canon |
|-------|-------|-------------|
| `Bes` | `Bes` | `Bb`        |
| `Bb`  | `Bb`  | `Bb`        |
| `B♭`  | `B♭`  | `Bb`        |

For the chord quality:

| name   | qual  | qual\_canon |
|--------|-------|-------------|
| `A+`   | `+`   | `+`         |
| `Aaug` | `aug` | `+`         |

Alternatives for root names are defined in the `notes` section of the [config file](https://www.chordpro.org/chordpro/chordpro-configuration-instrument/#root).  
Alternatives for chord qualities and extensions are currently built-in.

ChordPro will use the chord properties to show a chord name in the output. If config item `settings.chords-canonical` is set, the canonical set of chord properties will be used instead.

It is important to realise that when transposing or transcoding the resultant `root` and `root_canon` will both have the same, canonical value.

Formatting
----------

When it comes to formatting the chord for output purposes, ChordPro uses a format string to control how the output must look like. The format string is subject to [metadata substitution](https://www.chordpro.org/chordpro/chordpro-configuration-format-strings/). This does, however, not use the usual set of metadata but uses the chord properties instead.

Since the chord properties are derived from the given name, `%{root}%{qual}%{ext}%{bass|/%{}}` will yield the given name again.

The default chord format string is the value of config item `settings.chord-format`, and its default value is:

    %{root|%{}%{qual}%{ext}%{bass|/%{}}|%{name}}

If property `root` is not empty this indicates that the chord was successfully parsed. The format will then use the chord properties `root`, `qual`, `ext` and `bass`. Otherwise it uses the `name` property.

**Important 1:** Do not leave out the alternative to show the `name` property otherwise unparsable chords, including `NC`, will not show in the output.

**Important 2:** When using a format string in a define directive, you **must** put a backslash `\` before each occurrence of `%{` to prevent the substitution to happen ’too early’, i.e. when the directive itself is processed. The default format string, when used in a define directive, looks like:

    {define ... format "\%{root|\%{}\%{qual}\%{ext}\%{bass|/\%{}}|\%{name}}"}
