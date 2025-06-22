export type ChordDto = {
  name: string;
  position: number;
};

export type SongLineDto = {
  words: string[];
  chords: ChordDto[];
};

export type SongDto = {
  id: string;
  title: string;
  artist: string;
  lines: SongLineDto[];
};

export type SongDescrDto = {
  id: string;
  title: string;
  artist: string;
};

const mockData: SongDto[] = [
  {
    id: "1",
    title: "Let It Be",
    artist: "The Beatles",
    lines: [
      {
        words: ["When", "I", "find", "myself", "in", "times", "of", "trouble"],
        chords: [
          { name: "C", position: 2 },
          { name: "G", position: 5 },
        ],
      },
      {
        words: ["Mother", "Mary", "comes", "to", "me"],
        chords: [
          { name: "Am", position: 0 },
          { name: "Am/G", position: 1 },
          { name: "Fmaj7", position: 2 },
          { name: "F6", position: 4 },
        ],
      },
      {
        words: ["Speaking", "words", "of", "wisdom"],
        chords: [
          { name: "C", position: 0 },
          { name: "G", position: 3 },
        ],
      },
      {
        words: ["Let", "it", "be"],
        chords: [
          { name: "F", position: 2 },
          { name: "C/E", position: 3 },
          { name: "Dm7", position: 4 },
          { name: "C", position: 5 },
        ],
      },
      // Chorus
      {
        words: ["Let", "it", "be", "let", "it", "be"],
        chords: [
          { name: "F", position: 0 },
          { name: "C/E", position: 2 },
          { name: "Dm7", position: 3 },
          { name: "C", position: 4 },
        ],
      },
      {
        words: ["Whisper", "words", "of", "wisdom"],
        chords: [
          { name: "C", position: 0 },
          { name: "G", position: 3 },
        ],
      },
      {
        words: ["Let", "it", "be"],
        chords: [
          { name: "F", position: 2 },
          { name: "C/E", position: 3 },
          { name: "Dm7", position: 4 },
          { name: "C", position: 5 },
        ],
      },
      {
        words: ["Let", "it", "be"],
        chords: [
          { name: "F", position: 2 },
          { name: "C/E", position: 3 },
          { name: "Dm7", position: 4 },
          { name: "C", position: 5 },
        ],
      },
      {
        words: ["Let", "it", "be"],
        chords: [
          { name: "F", position: 2 },
          { name: "C/E", position: 3 },
          { name: "Dm7", position: 4 },
          { name: "C", position: 5 },
        ],
      },
      {
        words: ["Let", "it", "be"],
        chords: [
          { name: "F", position: 2 },
          { name: "C/E", position: 3 },
          { name: "Dm7", position: 4 },
          { name: "C", position: 5 },
        ],
      },
    ],
  },
];
mockData.forEach((song, index) => {
  song.lines.push(...song.lines); // Duplicate lines for testing
});

export class SongService {
  static listSongs = async (): Promise<SongDescrDto[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
    }));
  };

  static getSong = async (songId: string): Promise<SongDto | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData.find((song) => song.id === songId) || null;
  };
}
