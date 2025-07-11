#!/bin/bash


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
function parse_md() {
    local file="$1"
    local out="${file%.md}.pro"
    # go run ../../api/cmd/md2chordpro/main.go "$file" "$out"
    node ../../tools/dist/parse-md.js "$file" "$out"
}

mkdir -p data/5lad
cd data/5lad

# download_link https://www.5lad.net/akkordy/zemfira/arividerchi

# Parse the downloaded HTML files to markdown
# find . -name "*.html" | while read file; do
#     parse_html "$file"
# done

# Parse .md files to .pro
find . -name "*.md" | while read file; do
    parse_md "$file"
done