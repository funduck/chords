#!/bin/bash
# This script downloads the ChordPro specification and cheat sheet from the official website.

function download_link() {
    local link="$1"
    wget --mirror --convert-links --adjust-extension --page-requisites --no-parent "$link"
}
function parse_html() {
    local file="$1"
    local out="${file%.html}.md"
    pandoc --from=html-native_divs-native_spans --to=markdown --strip-comments "$file" -o "$out"
}


# Download to ./data
mkdir -p data
cd data

links="https://www.chordpro.org/chordpro/chordpro-directives/ https://www.chordpro.org/chordpro/chordpro-cheat_sheet/ https://www.chordpro.org/chordpro/chordpro-chords/"

# Download the main links
for link in ${links}; do
    download_link "$link"
done
# Parse the downloaded HTML files to markdown
find . -name "*.html" | while read file; do
    parse_html "$file"
done

# Extract directives links
grep "https://www.chordpro.org/chordpro/directives-" www.chordpro.org/chordpro/chordpro-directives/index.md | sed 's/.*(\(.*\)).*/\1/' | sort -u | while read link; do
    download_link "$link"
done
# Parse the downloaded HTML files to markdown
find . -name "*.html" | while read file; do
    parse_html "$file"
done

mkdir -p data/chordpro-specification
# Copy markdown files to specification directory
# All markdown files are named index.md so we have to prepend the parent directory name
find . -name "index.md" | while read file; do
    parent_dir=$(dirname "$file")
    dir="$(basename "$parent_dir")"
    cp "$file" "data/chordpro-specification/${dir}.md"
done