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
  chords: new Map(
    Object.entries(RawChordsDB.chords).map(([key, value]) => [
      key,
      new Map(value.map((chord) => [chord.suffix, chord])),
    ]),
  ),
};

export default ChordsDB;
