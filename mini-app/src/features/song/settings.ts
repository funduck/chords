import { BaseSettings } from "@src/services/settings.service";

export class SongSettings extends BaseSettings {
  showChords: boolean = true;
  autoScroll: boolean = false;
  autoScrollSpeed: number = 1;
  autoScrollInterval: number = 100;
}
