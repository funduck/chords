import {
  Chord,
  ChordProFormatter,
  ChordProParser,
  ChordsOverWordsFormatter,
  ChordsOverWordsParser,
  Song,
} from "chordsheetjs";

export class ChordProService {
  static adjustLineLength(song: Song, maxLineLength: number): Song {
    const formater = new ChordProFormatter();
    let sheet = formater.format(song);

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

    const parser = new ChordProParser();
    const newSong = parser.parse(resLines.join("\n"));
    return newSong;
  }

  static songToSheet(
    song: Song,
    options: { format?: "chordsoverwords" | "chordpro"; maxLineLength?: number } = {},
  ): string {
    if (!song) return "";

    if (options.maxLineLength) {
      song = this.adjustLineLength(song, options.maxLineLength);
    }

    const formater = options.format == "chordsoverwords" ? new ChordsOverWordsFormatter() : new ChordProFormatter();
    let sheet = formater.format(song);

    if (options.format != "chordsoverwords") {
      // Later we want to recognize sheet as ChordPro, so we need to ensure it has a title
      if (!song.title && !sheet.match(/{title/)) {
        sheet = `{title}\n${sheet}`;
      }
    }

    return sheet;
  }

  static sheetToSong(
    sheet: string,
    options: { parse?: "chordsoverwords" | "chordpro"; maxLineLength?: number } = {},
  ): Song | null {
    try {
      let parser: { parse: (sheet: string) => Song };
      if (options.parse == "chordpro" || sheet.match(/{(title|artist|composer)/)) {
        parser = new ChordProParser();
      } else {
        parser = new ChordsOverWordsParser();
      }
      let song = parser.parse(sheet);
      if (options.maxLineLength) {
        sheet = this.songToSheet(song, { maxLineLength: options.maxLineLength });
        song = parser.parse(sheet);
      }
      return song;
    } catch (error) {
      console.debug("Failed to parse sheet to Song:", error);
      return null;
    }
  }

  static sheetToChordProSheet(
    sheet: string,
    options: { parse?: "chordsoverwords" | "chordpro"; maxLineLength?: number } = {},
  ): string {
    if (!sheet || !sheet.trim()) {
      return "";
    }
    const song = this.sheetToSong(sheet, options);
    if (!song) {
      console.warn("Failed to parse song from sheet");
      return "";
    }

    return this.songToSheet(song, {
      maxLineLength: options.maxLineLength,
    });
  }

  static transposeSong(song: Song, transpose: number): Song {
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
