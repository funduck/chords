export class SongSettingsDto {
  show_chords: boolean = true;
  auto_scroll: boolean = false;
  auto_scroll_speed: number = 1;
  auto_scroll_interval: number = 100;

  fromJson(obj: string): SongSettingsDto {
    if (!obj) {
      return this;
    }
    const parsed = JSON.parse(obj);
    this.show_chords = parsed.show_chords ?? this.show_chords;
    this.auto_scroll = parsed.auto_scroll ?? this.auto_scroll;
    this.auto_scroll_speed = parsed.auto_scroll_speed ?? this.auto_scroll_speed;
    this.auto_scroll_interval = parsed.auto_scroll_interval ?? this.auto_scroll_interval;
    return this;
  }
}
