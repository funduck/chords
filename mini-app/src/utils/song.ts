import { Song } from "chordsheetjs";

export function getSongArtist(song: Song): string[] | null {
  if (!song.artist) return null;
  return Array.isArray(song.artist) ? song.artist : [song.artist];
}
