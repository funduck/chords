export type Main = {
  strings: number;
  fretsOnChord: number;
  name: string;
  numberOfChords: number;
};

export type Tunings = {
  standard: string[];
};

export type ChordPosition = {
  frets: number[];
  fingers: number[];
  barres?: number[];
  capo?: boolean;
  baseFret?: number;
  midi?: number[];
};

export type Chord = {
  key: string;
  suffix: string;
  positions: ChordPosition[];
};
