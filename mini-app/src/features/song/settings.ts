import { BaseSettings } from "@src/services/settings.service";

export class SongSettings extends BaseSettings {
  showChords: boolean = true;
  autoScroll: boolean = false;
}
