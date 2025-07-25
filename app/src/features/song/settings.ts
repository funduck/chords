export class SongSettingsDto {
  show_chords: boolean = true;
  auto_scroll: boolean = false;
  auto_scroll_speed: number = 1;
  auto_scroll_interval: number = 100;

  fromJson(obj: any): SongSettingsDto {
    if (!obj) {
      return this;
    }
    this.show_chords = obj.show_chords ?? this.show_chords;
    this.auto_scroll = obj.auto_scroll ?? this.auto_scroll;
    this.auto_scroll_speed = obj.auto_scroll_speed ?? this.auto_scroll_speed;
    this.auto_scroll_interval = obj.auto_scroll_interval ?? this.auto_scroll_interval;
    return this;
  }
}
