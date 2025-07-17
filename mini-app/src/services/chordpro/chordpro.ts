import { Chord, ChordProFormatter, ChordProParser, ChordsOverWordsParser, Song } from "chordsheetjs";

export class ChordProService {
  static adjustLineLength(sheet: string, maxLineLength: number): string {
    const resLines: string[] = [];
    const lines = sheet.split("\n");
    for (const line of lines) {
      if (!line.startsWith("{") && line.length > maxLineLength) {
        const rest = line.split(" ").reduce((acc, word) => {
          if (acc.length + word.length + 1 > maxLineLength) {
            resLines.push(acc);
            return word; // Start new line with the current word
          }
          return acc ? `${acc} ${word}` : word; // Add space if acc is not empty
        }, "");
        if (rest) {
          resLines.push(rest); // Add the last part if it exists
        }
      } else {
        resLines.push(line);
      }
    }
    return resLines.join("\n");
  }

  static parseToChordproSheet(
    sheet: string,
    options: { parse?: "chordsoverwords" | "chordpro"; maxLineLength?: number } = {},
  ): string {
    if (!sheet || !sheet.trim()) {
      throw new Error("Empty sheet cannot be parsed");
    }
    let parser: { parse: (sheet: string) => Song };
    if (options.parse == "chordpro" || sheet.match(/{(title|artist|composer):/)) {
      parser = new ChordProParser();
    } else {
      parser = new ChordsOverWordsParser();
    }
    const song = parser.parse(sheet);
    const formater = new ChordProFormatter();
    sheet = formater.format(song);
    if (options.maxLineLength) {
      sheet = this.adjustLineLength(sheet, options.maxLineLength);
    }
    return sheet;
  }

  static parseToSong(
    sheet: string,
    options: { parse?: "chordsoverwords" | "chordpro"; maxLineLength?: number } = {},
  ): Song {
    sheet = this.parseToChordproSheet(sheet, options);
    const parser = new ChordProParser();
    return parser.parse(sheet);
  }

  static transpose(song: Song, transpose: number): Song {
    let key = song.key;
    if (!key) {
      // Transposition requires a key, so we have to pick one
      key =
        song
          .getChords()
          .map((c) => Chord.parse(c)?.root?.note)
          .find(Boolean) || "C"; // Default to C if no chords found
      song = song.setKey(key);
      console.debug("No key found, using key:", key);
    }
    const newKey = song.requireCurrentKey().transpose(transpose);
    return song.changeKey(newKey);
  }
}
