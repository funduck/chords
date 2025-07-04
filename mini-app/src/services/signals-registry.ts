import { signal } from "@telegram-apps/signals";

import { RoomEntity } from "@src/hooks/Api";

import { SongSettings } from "../features/song/settings";

export class Signals {
  static wsEventsConnected = signal(false);
  static accessToken = signal<string | null>(null);

  static userId = signal<number | null>(null);
  static room = signal<RoomEntity | null>(null);

  static applySongSettings = signal<SongSettings | null>(null);
  static publishSongSettings = signal<SongSettings | null>(null);

  static applySongScroll = signal<number | null>(null);
  static publishSongScroll = signal<number | null>(null);

  static publishSongId = signal<number | null>(null);
}
