import ChordSheetJS from "chordsheetjs";
import { Song } from "chordsheetjs";

import { ChordsService } from "../chords/chords";

// Weird importing is needed to allow testing
const { Chord, ChordProFormatter, ChordProParser, ChordsOverWordsParser, UltimateGuitarParser } = ChordSheetJS;

export class ChordProService {
  static adjustLineLength(sheet: string, maxLineLength: number): string {
    if (maxLineLength < 20) {
      console.warn("Max line length is too short, skipping adjustment");
      return sheet;
    }

    const resLines: string[] = [];
    const lines = sheet.split("\n");
    let isTab = false;
    let isDirective = false;
    for (const line of lines) {
      isDirective = line.startsWith("{");
      if (isDirective && line.match(/^\{(sot|start_of_tab)/)) {
        isTab = true;
      }
      if (isDirective && line.match(/^\{(eot|end_of_tab)/)) {
        isTab = false;
      }
      if (!isDirective && !isTab && line.length > maxLineLength) {
        // We have to track brackets to avoid breaking inside them
        const brackets = { "[": 0, "]": 0 };

        const rest = line.split(" ").reduce((acc, word) => {
          // Check if we are inside brackets before the word
          const inBrackets = brackets["["] > brackets["]"];
          // Count brackets in the word
          for (const char of word) {
            if (char == "[") {
              brackets["["]++;
            } else if (char == "]") {
              brackets["]"]++;
            }
          }

          if (acc.length + word.length + 1 > maxLineLength) {
            if (inBrackets) {
              // We cannot break inside brackets, we need to break before the last bracket
              const idx = acc.lastIndexOf("[");
              if (idx > 0) {
                resLines.push(acc.slice(0, idx).trim());
                return `${acc.slice(idx)} ${word}`; // Start new line with the brackets part and current word
              }

              console.error("isBracket is true, but no brackets found in the line:", line);
            }

            resLines.push(acc.trim());
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

  static beforeParse(sheet: string): string {
    // TODO add tests for this file

    // Change chord H to B
    sheet = sheet.replace(/(\[|^|\s)(H)(|m)(|7|aj|7maj|dim)(\]|$|\s)/g, "$1B$3$4$5");

    // // Split sequences of chords like: (E/F#-E/G#-E/A)
    // sheet = sheet.replace(new RegExp(`\\(\\s*(${chordRegex}[\\-\\s]+)+(${chordRegex})\\s*\\)`, "g"), (match) => {
    //   return match
    //     .slice(1, -1) // Remove parentheses
    //     .split(/[\- ]/)
    //     .map((chord) => chord.trim())
    //     .filter((chord) => chord) // Remove empty strings
    //     .join(" ");
    // });

    return sheet;
  }

  static beforeFormat(sheet: string): string {
    const resLines: string[] = [];
    const lines = sheet.split("\n");

    for (const line of lines) {
      const re = line.match(/^(.+)(\{(?:sot|start_of_tab|soc|start_of_chorus|sov|start_of_verse).+)$/);
      if (re) {
        if (re[1]) {
          resLines.push(re[1]); // Add the part before the directive
        }
        resLines.push(""); // Add an empty line before the start of tab/chorus
        resLines.push(re[2]); // Add the directive line
        continue;
      }
      resLines.push(line);
    }

    return resLines.join("\n");
  }

  static afterFormat(sheet: string): string {
    // Later we want to recognize sheet as ChordPro, so we need to ensure it has a title
    if (!sheet.match(/{title/)) {
      sheet = `{title}\n${sheet}`;
    }

    // Replace empty sections [  ]
    sheet = sheet.replace(/\[\s*\]/g, "");

    // Recognize all chords in the sheet without brackets
    sheet = sheet
      .split("\n")
      .map((line) => {
        if (!line.trim()) {
          return line; // Skip empty lines
        }

        let inBracket = false;
        return line
          .split(/(\s|\(|\)|-)/)
          .map((part) => {
            if (part.startsWith("[")) {
              inBracket = true;
              return part;
            }
            if (part.endsWith("]")) {
              inBracket = false;
              return part;
            }
            if (inBracket) {
              return part; // Inside brackets, do not change
            }
            // Outside brackets, recognize chords
            const isChord = ChordsService.isChord(part);
            if (isChord) {
              return `[${part}]`; // Add brackets around recognized chords
            }
            return part; // Leave other parts unchanged
          })
          .join("");
      })
      .join("\n");

    return sheet;
  }

  static songToSheet(
    song: Song,
    options: { format?: "chordpro"; maxLineLength?: number; throw?: boolean } = {},
  ): string {
    if (!song) return "";

    let formater = new ChordProFormatter();
    let sheet = formater.format(song);

    sheet = this.beforeFormat(sheet);

    if (options.maxLineLength) {
      sheet = this.adjustLineLength(sheet, options.maxLineLength);
    }

    sheet = this.afterFormat(sheet);

    return sheet;
  }

  static sheetToSong(
    sheet: string,
    options: {
      parse?: "chordsoverwords" | "chordpro" | "ultimateguitar";
      maxLineLength?: number;
      throw?: boolean;
    } = {},
  ): Song | null {
    sheet = this.beforeParse(sheet);

    try {
      let parser: { parse: (sheet: string) => Song } = new ChordProParser();
      if (!options.parse && sheet.match(/{(title|artist|composer)/)) {
        options.parse = "chordpro";
      }
      if (!options.parse && sheet.match(/\[(Chorus|Verse)/)) {
        options.parse = "ultimateguitar";
      }
      if (!options.parse) {
        options.parse = "chordsoverwords";
      }
      switch (options.parse) {
        case "chordsoverwords":
          parser = new ChordsOverWordsParser();
          break;
        case "ultimateguitar":
          parser = new UltimateGuitarParser();
          break;
        case "chordpro":
        default:
        // Already set above
      }
      let song = parser.parse(sheet);
      if (options.maxLineLength) {
        sheet = this.songToSheet(song, { maxLineLength: options.maxLineLength, throw: true });
        song = parser.parse(sheet);
      }
      return song;
    } catch (error) {
      console.debug("Failed to parse sheet to Song:", error);
      if (options.throw) {
        throw error;
      }
      return null;
    }
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

  static extractLyrics(sheet: string): string {
    const song = this.sheetToSong(sheet, {
      throw: true,
    });
    if (!song) {
      console.warn("Failed to parse song from sheet for lyrics extraction");
      return "";
    }
    const chordproSheet = this.songToSheet(song, { format: "chordpro", throw: true });
    return chordproSheet
      .split("\n")
      .map((line) =>
        line
          .replace(/\{[^\}]*\}/g, "") // Remove all directives
          .replace(/\[[^\]]*\]/g, "") // Remove all sections and chords
          .trim(),
      )
      .filter((line) => line) // Remove empty lines
      .join("\n");
  }
}
