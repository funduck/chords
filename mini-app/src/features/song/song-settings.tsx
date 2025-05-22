import { Cell, Section, Slider, Switch } from "@telegram-apps/telegram-ui";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { Signals } from "@src/signals-registry";
import { SettingsService } from "@src/services/settings.service";
import { SongSettings } from "./settings";

function SongSettingsControl() {
  const settings = useSignal(Signals.settingsSong);

  useEffect(() => {
    if (!settings) {
      SettingsService.load(SongSettings).then((loadedSettings) => {
        if (loadedSettings) {
          console.log("Song settings loaded");
          Signals.settingsSong.set(loadedSettings);
        } else {
          const newSettings = new SongSettings();
          Signals.settingsSong.set(newSettings);
          SettingsService.save(newSettings).then(() => console.log("Song settings created"));
        }
      });
    }
  }, [settings]);

  function setShowChords(value: boolean) {
    if (settings) {
      const newSettings = settings.cloneWith({ showChords: value });
      Signals.settingsSong.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  function setAutoScroll(value: boolean) {
    if (settings) {
      const newSettings = settings.cloneWith({ autoScroll: value });
      Signals.settingsSong.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  function setAutoScrollSpeed(speed: number, interval: number) {
    if (settings) {
      const newSettings = settings.cloneWith({ autoScrollSpeed: speed, autoScrollInterval: interval });
      Signals.settingsSong.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  return (
    <>
      <Cell
        after={
          <Switch
            disabled={!settings}
            checked={settings?.showChords ?? false}
            onChange={(e) => {
              setShowChords(e.target.checked);
            }}
          ></Switch>
        }
      >
        Show chords
      </Cell>
      <Cell
        after={
          <>
            <Switch
              disabled={!settings}
              checked={settings?.autoScroll ?? false}
              onChange={(e) => {
                setAutoScroll(e.target.checked);
              }}
            ></Switch>
          </>
        }
      >
        Auto scroll
      </Cell>
      <Section header="Auto scroll speed">
        <Slider
          onChange={(e) => {
            const speed = 1 + e / 50;
            const interval = 50 * 1.01 ** (speed - 1);
            setAutoScrollSpeed(speed, interval);
          }}
        />
      </Section>
    </>
  );
}

export default SongSettingsControl;
