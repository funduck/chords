import { Config } from "@src/config";

// Song view preferences that belong to the browser, not to a song or a session.
// Kept out of the "songState" blob so navigating between songs cannot reset them.
const KEY = "song-view-settings";

export interface SongViewSettings {
  fontSize: number;
  autoScrollSpeed: number;
}

function defaults(): SongViewSettings {
  return { fontSize: Config.SongFontSize, autoScrollSpeed: Config.AutoScrollSpeed };
}

export function loadSongViewSettings(): SongViewSettings {
  const fallback = defaults();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return fallback;
    }
    const saved = JSON.parse(raw);
    return {
      fontSize: Number(saved?.fontSize) || fallback.fontSize,
      autoScrollSpeed: Number(saved?.autoScrollSpeed) || fallback.autoScrollSpeed,
    };
  } catch (err) {
    // A corrupt entry must not stop the app from starting.
    console.error("Failed to read song view settings:", err);
    return fallback;
  }
}

export function saveSongViewSettings(settings: SongViewSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to save song view settings:", err);
  }
}
