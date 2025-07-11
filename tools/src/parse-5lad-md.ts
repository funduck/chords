import { ChordsOverWordsParser, ChordProFormatter } from "chordsheetjs";
import { readFile, writeFile } from "fs/promises";

const fileIn = process.argv[2];
const fileOut = process.argv[3];

if (!fileIn || !fileOut) {
  console.error("Usage: node parse-md.js <input-file> <output-file>");
  process.exit(1);
}

function extractSheetFromMarkdown(content: string): string {
  // Find the chord sheet in the pre/code block
  const preCodeMatch = content.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
  if (!preCodeMatch) {
    return "";
  }

  let sheet = preCodeMatch[1];

  // Clean up HTML entities
  sheet = sheet
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove the last line if it's "Подобрать аккорды без баррэ"
  const lines = sheet.split("\n");
  while (
    lines[lines.length - 1].trim() == "" ||
    lines[lines.length - 1].trim().match(/Подобрать аккорды без баррэ/)
  ) {
    lines.pop();
  }

  // replace Hm with Bm
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replace(/\bH(m?)\b/g, "B$1");
  }

  return lines.join("\n");
}

function extractTitleAndArtistFromMarkdown(content: string): {
  title: string;
  artist: string;
} {
  const lines = content.split("\n");
  for (const line of lines) {
    // Look for the pattern "Artist - Title: аккорды" in the header
    const headerMatch = line.match(/^(.+)\s+-\s+([^:]+):\s*аккорды/);
    if (headerMatch) {
      return {
        artist: headerMatch[1].trim(),
        title: headerMatch[2].trim(),
      };
    }
  }
  throw new Error("Title and artist not found in the markdown content");
}

async function main() {
  try {
    const content = await readFile(fileIn, "utf-8");

    const parser = new ChordsOverWordsParser();
    const sheet = extractSheetFromMarkdown(content);
    // console.log(`Extracted sheet:\n${sheet}`);
    const song = parser.parse(sheet);
    const formater = new ChordProFormatter();
    let chordpro = formater.format(song);

    const { title, artist } = extractTitleAndArtistFromMarkdown(content);
    // console.log(`Extracted title: ${title}, artist: ${artist}`);
    if (title) {
      chordpro = `{title: ${title}}\n${chordpro}`;
    }
    if (artist) {
      chordpro = `{artist: ${artist}}\n${chordpro}`;
    }

    await writeFile(fileOut, chordpro, "utf-8");
    console.log(`Converted ${fileIn} to ${fileOut}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
