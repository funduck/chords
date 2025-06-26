import { useSignal } from "@telegram-apps/sdk-react";
import { useRef, useState } from "react";

import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Slider from "@components/Slider";
import Stack from "@components/Stack";
import Switch from "@components/Switch";

function SongSettingsControl() {
  const settings = useSignal(Signals.applySongSettings);

  function setShowChords(value: boolean) {
    console.debug("setShowChords", value);
    if (settings) {
      const newSettings = settings.cloneWith({ show_chords: value });
      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings)
        .then(() => console.log("Song settings updated"))
        .catch(console.error);
    }
  }

  function setAutoScroll(value: boolean) {
    console.debug("setAutoScroll", value);
    if (settings) {
      const newSettings = settings.cloneWith({ auto_scroll: value });
      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings)
        .then(() => console.log("Song settings updated"))
        .catch(console.error);
    }
  }

  function setAutoScrollSpeed(speed: number, interval: number) {
    console.debug("setAutoScrollSpeed", speed, interval);
    if (settings) {
      const newSettings = settings.cloneWith({ auto_scroll_speed: speed, auto_scroll_interval: interval });
      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings)
        .then(() => console.log("Song settings updated"))
        .catch(console.error);
    }
  }

  return (
    <Stack gap="xl">
      <Switch
        label="Show chords"
        disabled={!settings}
        checked={settings?.show_chords ?? false}
        onChange={setShowChords}
      />
      <Switch
        label="Auto scroll"
        disabled={!settings}
        checked={settings?.auto_scroll ?? false}
        onChange={setAutoScroll}
      />
      <Slider
        label="Auto scroll speed"
        disabled={!settings}
        onChange={(e) => {
          const speed = e;
          const interval = 2000;
          setAutoScrollSpeed(speed, interval);
        }}
        value={settings?.auto_scroll_speed ?? 0}
      />
    </Stack>
  );
}

export default SongSettingsControl;
