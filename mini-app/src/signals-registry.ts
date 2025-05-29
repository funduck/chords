import { signal } from "@telegram-apps/signals";
import { SongSettings } from "./features/song/settings";

export class Signals {
  static wsEventsConnected = signal(false);
  static isTelegramAuthorized = signal(false);
  static language = signal<string | null>(null);
  static accessToken = signal<string | null>(null);
  static selectedTabId = signal<string | null>(null);
  static selectedSongId = signal<string | null>(null);
  static settingsSong = signal<SongSettings | null>(null);
}
