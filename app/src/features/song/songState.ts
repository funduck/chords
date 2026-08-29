import { SongEntity } from "@src/hooks/Api";

// The song the user was last looking at, so a refresh does not lose their place.
// View preferences live separately in ./viewSettings.
const KEY = "songState";

export interface SongState {
  songId?: number;
  loadedSong?: SongEntity;
  songSheet?: string;
  newSheet?: string;
  scrollPosition?: number; // percentage (0-100) within the song viewport
}

export function loadSongState(): SongState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return {};
    }
    const saved = JSON.parse(raw);
    return {
      songId: saved?.songId ?? undefined,
      loadedSong: saved?.loadedSong ?? undefined,
      songSheet: saved?.songSheet ?? undefined,
      newSheet: saved?.newSheet ?? undefined,
      scrollPosition: typeof saved?.scrollPosition === "number" ? saved.scrollPosition : undefined,
    };
  } catch (err) {
    // A corrupt entry must not stop the app from starting.
    console.error("Failed to read song state:", err);
    return {};
  }
}

export function saveSongState(state: SongState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save song state:", err);
  }
}
