#!/bin/bash
# This script downloads the ChordPro specification and cheat sheet from the official website.

function download_link() {
    local link="$1"
    wget --mirror --convert-links --adjust-extension --page-requisites --no-parent "$link"
}
function parse_html() {
    local file="$1"
    local out="${file%.html}.md"
    pandoc --from=html -t markdown_strict+pipe_tables+fenced_code_blocks+backtick_code_blocks --wrap=none "$file" -o "$out"
    # pandoc --from=html -t gfm+backtick_code_blocks --wrap=none "$file" -o "$out"
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

find -name "*.md" | while read file; do
    # Convert links like 
    # https://www.chordpro.org/chordpro/directives-new_page/
    # to relative links like ./directives-new_page.md
    sed -i 's/https:\/\/www\.chordpro\.org\/chordpro\/directives-\([a-zA-Z\-_]\+\)\//\.\/directives-\1\.md/g' "$file"

    # And convert blocks like this
    # {meta: composer John Lennon}
    # {meta: composer Paul McCartney}
    # to inline code blocks
    sed -i 's/^\([ ]*{[^}]*}\)$/`\1`/g' "$file"
    echo "Processed $file"
done

mkdir -p ../docs/chordpro-specification
# Copy markdown files to specification directory
# All markdown files are named index.md so we have to prepend the parent directory name
find . -name "index.md" | while read file; do
    parent_dir=$(dirname "$file")
    dir="$(basename "$parent_dir")"
    cp "$file" "../docs/chordpro-specification/${dir}.md"
done