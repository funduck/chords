import { signal } from "@telegram-apps/signals";

import { ArtistInfoEntity } from "@src/hooks/Api";

export class Signals {
  static wsEventsConnected = signal(false);
  static accessToken = signal<string | null>(null);

  static userId = signal<number | null>(null);

  static artist = signal<ArtistInfoEntity | null>(null);
}
