# md2chordpro - Markdown to ChordPro Converter

This utility converts markdown files containing song lyrics with chords to ChordPro format.

## Usage

```bash
go run cmd/md2chordpro/main.go <input.md> [output.pro]
```

## Example

Convert a Russian song from 5lad.net format:

```bash
go run cmd/md2chordpro/main.go /path/to/song.md song.pro
```

## Features

- Extracts song title and artist from markdown headers
- Converts chord-over-lyrics format to ChordPro format with `[chord]` notation
- Handles chords positioned within words (e.g., `[Am]Курить[F],`)
- Detects and marks chorus sections with `{start_of_chorus}` and `{end_of_chorus}`
- Supports Russian lyrics with Cyrillic characters
- Handles complex chord alignments and spacing

## Input Format

The utility expects markdown files with:
- Title in format: `Artist - Song Title: аккорды`
- Song content within `<pre><code>` tags
- Chords on separate lines above their corresponding lyrics
- Chorus sections marked with "Припев:" 

## Output Format

Produces ChordPro files with:
- `{title: Song Title}` directive
- `{artist: Artist Name}` directive
- Chords embedded in lyrics using `[chord]` notation
- Chorus sections marked with environment directives

## Example Conversion

**Input:**
```
Земфира - Аривидерчи: аккорды
<pre><code>
Dm               E
Вороны-москвички   меня разбудили,
  Am    F
Курить,
</code></pre>
```

**Output:**
```chordpro
{title: Аривидерчи}
{artist: Земфира}

[Dm]Вороны-москвички [E]  меня разбудили,
[Am]Курить[F],
```
