import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/signals-registry";

import Cell from "@components/cell";
import Section from "@components/section";
import Slider from "@components/slider";
import Switch from "@components/switch";

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
    <>
      <Cell
        after={
          <Switch
            disabled={!settings}
            checked={settings?.show_chords ?? false}
            onChange={(e) => {
              setShowChords(e.target.checked);
            }}
          />
        }
      >
        Show chords
      </Cell>
      <Cell
        after={
          <Switch
            disabled={!settings}
            checked={settings?.auto_scroll ?? false}
            onChange={(e) => {
              setAutoScroll(e.target.checked);
            }}
          />
        }
      >
        Auto scroll
      </Cell>
      <Section header="Auto scroll speed">
        <Slider
          onChange={(e) => {
            const speed = 1 + e / 30;
            const interval = 100 * 1.01 ** (speed - 1);
            setAutoScrollSpeed(speed, interval);
          }}
        />
      </Section>
    </>
  );
}

export default SongSettingsControl;
