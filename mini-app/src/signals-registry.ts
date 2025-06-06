import { signal } from "@telegram-apps/signals";
import { SongSettings } from "./features/song/settings";
import { ChordsComApiInternalEntityRoom } from "./generated/api";

export class Signals {
  static wsEventsConnected = signal(false);
  static isTelegramAuthorized = signal(false);
  static language = signal<string | null>(null);
  static accessToken = signal<string | null>(null);
  static selectedTabId = signal<string | null>(null);
  static selectedSongId = signal<string | null>(null);
  static userId = signal<number | null>(null);
  static room = signal<ChordsComApiInternalEntityRoom | null>(null);

  static applySongSettings = signal<SongSettings | null>(null);
  static publishSongSettings = signal<SongSettings | null>(null);

  static applySongScroll = signal<number | null>(null);
  static publishSongScroll = signal<number | null>(null);
}
