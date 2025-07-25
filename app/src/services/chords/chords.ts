import RawChordsDB from "./guitar";
import { Chord } from "./types";

const ChordsDB: {
  main: {
    strings: number;
    fretsOnChord: number;
    name: string;
    numberOfChords: number;
  };
  tunings: {
    standard: string[];
  };
  keys: string[];
  suffixes: string[];
  chords: Map<string, Map<string, Chord>>;
} = {
  main: RawChordsDB.main,
  tunings: RawChordsDB.tunings,
  keys: RawChordsDB.keys,
  suffixes: RawChordsDB.suffixes,
  chords: new Map(),
};

// Populate the chords map from the raw chords database
// Map will be mush faster for lookups
for (const [_, chords] of Object.entries(RawChordsDB.chords)) {
  for (const chord of chords) {
    if (!ChordsDB.chords.has(chord.key)) {
      ChordsDB.chords.set(chord.key, new Map());
    }
    ChordsDB.chords.get(chord.key)!.set(chord.suffix, chord);
  }
}

export class ChordsService {
  /** Finds matching Chord in database */
  static getChord(name: string): {
    comment?: string;
    chord: Chord | undefined;
  } {
    let chordName = name;
    let comment = "";

    let note = name.slice(0, 1);
    let suffix = name.slice(1) || "";

    // Handle cases like "Bb" or "C#"
    if (suffix.startsWith("b") || suffix.startsWith("#")) {
      note += suffix.slice(0, 1);
      suffix = suffix.slice(1);
    }

    // Normalize note names
    switch (note) {
      case "D#":
        note = "Eb";
        break;
      case "G#":
        note = "Ab";
        break;
      case "A#":
        note = "Bb";
        break;
      case "H":
        note = "B";
        break;
      case "B#":
        note = "C";
        break;
      case "Cb":
        note = "B";
        break;
    }

    // Handle cases like "Cma7" -> "Cmaj7"
    if (suffix.match(/^ma[0-9]/)) {
      suffix = suffix.replace(/^ma([0-9])/, "maj$1");
    }

    switch (suffix) {
      case "":
        suffix = "major";
        break;
      case "m":
      case "min":
        suffix = "minor";
        break;
      case "add":
      case "(9)":
        suffix = "add9";
        break;
      case "(11)":
        suffix = "add11";
        break;
      default:
        break;
    }

    chordName = `${note}${suffix}`.trim();

    let chord = ChordsDB.chords.get(note)?.get(suffix);
    if (!chord) {
      // Fallback to major chord if no specific suffix found
      chord = ChordsDB.chords.get(note)?.get("maj") || ChordsDB.chords.get(note)?.get("");
      if (!chord) {
        comment = `Chord "${name}" not found in the database. And no fallback available.`;
      }
      if (chord) {
        chordName = `${chord.key}${chord.suffix}`.trim();
        comment = `Chord "${name}" but not found in the database. Using fallback "${chordName}".`;
      }
    }

    return {
      comment,
      chord,
    };
  }
}
