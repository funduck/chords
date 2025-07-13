import { Chord, ChordProParser } from "chordsheetjs";

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

  static parse(sheet: string, transpose?: number) {
    const parser = new ChordProParser();

    let song = parser.parse(sheet);

    if (transpose != null && transpose != 0) {
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
      song = song.changeKey(newKey);
    }

    return song;
  }
}
