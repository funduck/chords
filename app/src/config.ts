const IsDev = import.meta.env.VITE_DEV == "true";
const ApiUri = import.meta.env.VITE_API_URI;
const SSLSuffix = import.meta.env.VITE_API_SSL == "true" ? "s" : "";
const ApiHttpUrl = `http${SSLSuffix}://${ApiUri}`;
const ApiWsUrl = `ws${SSLSuffix}://${ApiUri}`;
const AutoScrollSpeed = parseInt(import.meta.env.VITE_AUTO_SCROLL_SPEED || "50", 10);
const AutoScrollInterval = parseInt(import.meta.env.VITE_AUTO_SCROLL_INTERVAL || "2000", 10);
const AutoScrollEnabled = import.meta.env.VITE_AUTO_SCROLL_ENABLED == "true";
const SearchPageSize = parseInt(import.meta.env.VITE_SEARCH_PAGE_SIZE || "30", 10);
const SongFontSize = parseInt(import.meta.env.VITE_SONG_FONT_SIZE || "15", 10);
const StrictMode = import.meta.env.VITE_STRICT_MODE == "true";

export const Config = {
  IsDev,
  ApiUri,
  SSLSuffix,
  ApiHttpUrl,
  ApiWsUrl,
  AutoScrollSpeed,
  AutoScrollInterval,
  AutoScrollEnabled,
  SearchPageSize,
  SongFontSize,
  StrictMode,
};
