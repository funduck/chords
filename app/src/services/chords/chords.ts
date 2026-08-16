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
for (const chords of Object.values(RawChordsDB.chords)) {
  for (const chord of chords) {
    if (!ChordsDB.chords.has(chord.key)) {
      ChordsDB.chords.set(chord.key, new Map());
    }
    ChordsDB.chords.get(chord.key)!.set(chord.suffix, chord);
  }
}

/** Splits a chord name into its root note and (raw) suffix, normalizing the
 * note to the enharmonic spelling used by the database (e.g. "D#" -> "Eb"). */
function splitNoteSuffix(name: string): { note: string; suffix: string } {
  let note = name.slice(0, 1);
  let suffix = name.slice(1) || "";

  // Handle cases like "Bb" or "C#"
  if (suffix.startsWith("b") || suffix.startsWith("#")) {
    note += suffix.slice(0, 1);
    suffix = suffix.slice(1);
  }

  // Normalize note names to the DB's enharmonic spelling
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

  return { note, suffix };
}

/** Normalizes a chord suffix to the canonical form used by the database.
 * Handles alternate symbols (+, °, ø, -), parenthesized alterations, and
 * common aliases so that e.g. "m7(b5)" -> "m7b5" and "+" -> "aug". */
function normalizeSuffix(suffix: string): string {
  // Alternate symbols for quality
  suffix = suffix
    .replace(/°7/g, "dim7")
    .replace(/°/g, "dim")
    .replace(/ø7?/g, "m7b5");

  // "Cma7" -> "Cmaj7"
  if (suffix.match(/^ma[0-9]/)) {
    suffix = suffix.replace(/^ma([0-9])/, "maj$1");
  }

  switch (suffix) {
    case "":
      return "major";
    case "m":
    case "min":
    case "-":
      return "minor";
    case "+":
      return "aug";
    case "2":
      return "sus2";
    case "add":
    case "(9)":
      return "add9";
    case "(11)":
      return "add11";
    case "7(#9)":
      return "7#9";
  }

  // Generic parenthesis stripping for alterations, e.g. "m7(b5)" -> "m7b5",
  // "7(b9)" -> "7b9". Applied after the special-cases above so aliases win.
  if (suffix.includes("(")) {
    const stripped = suffix.replace(/[()]/g, "");
    if (ChordsDB.suffixes.includes(stripped)) {
      return stripped;
    }
    suffix = stripped;
  }

  return suffix;
}

export class ChordsService {
  /** Finds matching Chord in database */
  static getChord(name: string): {
    comment?: string;
    chord: Chord | undefined;
  } {
    const { comment, chord } = ChordsService.resolve(name);
    return { comment, chord };
  }

  /** Resolves a chord name to a Chord. `matched` is true only for a genuine
   * recognition (exact suffix, normalized alias, or slash decomposition) and
   * false for the generic major fallback — so detection (`isChord`) can be
   * stricter than display, which happily shows a fallback diagram. */
  private static resolve(name: string): {
    comment: string;
    chord: Chord | undefined;
    matched: boolean;
  } {
    name = name.trim();

    const { note, suffix: rawSuffix } = splitNoteSuffix(name);
    const suffix = normalizeSuffix(rawSuffix);

    // Exact match (including exact slash suffixes like "/C", "m/C", "7/G")
    let chord = ChordsDB.chords.get(note)?.get(suffix);
    if (chord) {
      return { comment: "", chord, matched: true };
    }

    // Slash chord that isn't in the DB verbatim: decompose "F7/C" into base
    // "F7" over bass "C" and render the base chord with an explanatory note.
    const slashIndex = name.lastIndexOf("/");
    if (slashIndex > 0) {
      const base = name.slice(0, slashIndex);
      const bass = name.slice(slashIndex + 1);
      const baseResult = ChordsService.resolve(base);
      if (baseResult.chord && baseResult.matched) {
        const baseName = `${baseResult.chord.key}${baseResult.chord.suffix}`.trim();
        return {
          comment: `Chord "${name}" not found in the database. Showing "${baseName}" voiced over ${bass} in the bass.`,
          chord: baseResult.chord,
          matched: true,
        };
      }
    }

    // Fallback to the major chord if no specific suffix found. This is a
    // best-effort display aid only, so it does not count as a match.
    chord = ChordsDB.chords.get(note)?.get("major");
    if (!chord) {
      return {
        comment: `Chord "${name}" not found in the database. And no fallback available.`,
        chord: undefined,
        matched: false,
      };
    }

    const chordName = `${chord.key}${chord.suffix}`.trim();
    return {
      comment: `Chord "${name}" but not found in the database. Using fallback "${chordName}".`,
      chord,
      matched: false,
    };
  }

  static isChord(name: string): boolean {
    return ChordsService.resolve(name).matched;
  }
}
