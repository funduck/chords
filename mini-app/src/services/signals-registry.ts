import { signal } from "@telegram-apps/signals";

import { ArtistInfoEntity, RoomEntity } from "@src/hooks/Api";

import { SongSettingsDto } from "../features/song/settings";

export class Signals {
  static wsEventsConnected = signal(false);
  static accessToken = signal<string | null>(null);

  static userId = signal<number | null>(null);
  static room = signal<RoomEntity | null>(null);
  static searchTab = signal<string | null>(null);
  static artist = signal<ArtistInfoEntity | null>(null);
  static showRawSong = signal<boolean>(false);

  static applySongSettings = signal<SongSettingsDto | null>(null);
  static publishSongSettings = signal<SongSettingsDto | null>(null);

  static applySongScroll = signal<number | null>(null);
  static publishSongScroll = signal<number | null>(null);

  static publishSongId = signal<number | null>(null);
}
