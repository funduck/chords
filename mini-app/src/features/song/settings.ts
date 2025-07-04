import { BaseSettings } from "@src/services/settings.service";

export class SongSettingsDto extends BaseSettings {
  show_chords: boolean = true;
  auto_scroll: boolean = false;
  auto_scroll_speed: number = 1;
  auto_scroll_interval: number = 100;
}
