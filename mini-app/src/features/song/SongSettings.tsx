import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

import Slider from "@src/components/Slider";
import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Stack from "@components/Stack";
import Switch from "@components/Switch";

import { SongSettings } from "./settings";

function SongSettingsControl() {
  const settings = useSignal(Signals.applySongSettings);

  useEffect(() => {
    if (!settings) {
      SettingsService.load(SongSettings).then((loadedSettings) => {
        if (loadedSettings) {
          console.log("Song settings loaded");
          Signals.applySongSettings.set(loadedSettings);
        } else {
          const newSettings = new SongSettings();
          Signals.applySongSettings.set(newSettings);
          SettingsService.save(newSettings).then(() => console.log("Song settings created"));
        }
      });
    }
  }, [settings]);

  function setShowChords(value: boolean) {
    if (settings) {
      const newSettings = settings.cloneWith({ show_chords: value });

      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  function setAutoScroll(value: boolean) {
    if (settings) {
      const newSettings = settings.cloneWith({ auto_scroll: value });
      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  function setAutoScrollSpeed(speed: number, interval: number) {
    if (settings) {
      const newSettings = settings.cloneWith({ auto_scroll_speed: speed, auto_scroll_interval: interval });
      Signals.applySongSettings.set(newSettings);
      Signals.publishSongSettings.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
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
          const speed = 1 + e;
          const interval = 2000;
          setAutoScrollSpeed(speed, interval);
        }}
      />
    </Stack>
  );
}

export default SongSettingsControl;
