import { signal } from "@telegram-apps/signals";

export class Signals {
  static wsEventsConnected = signal(false);
  static isTelegramAuthorized = signal(false);
  static language = signal<string | null>(null);
  static selectedTabId = signal<string | null>(null);
  static selectedSongId = signal<string | null>(null);
}
