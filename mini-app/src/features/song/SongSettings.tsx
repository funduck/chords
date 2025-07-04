import { Image } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

import Button from "@src/components/Button";
import Dropdown from "@src/components/Dropdown";
import { AutoScrollEnabled, AutoScrollInterval, AutoScrollSpeed } from "@src/config";
import { useHeader } from "@src/hooks/Header";
import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Slider from "@components/Slider";
import Stack from "@components/Stack";
import Switch from "@components/Switch";

import { SongSettingsDto } from "./settings";

function PlayStop() {
  const settings = useSignal(Signals.applySongSettings);

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

  return (
    <Button variant="subtle" disabled={!settings} onClick={() => setAutoScroll(!settings?.auto_scroll)}>
      <Image
        src={settings?.auto_scroll ? "/src/assets/player-stop.svg" : "/src/assets/player-play.svg"}
        alt="Play/Stop Icon"
      />
    </Button>
  );
}

function FullSettings() {
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
    <Dropdown title={<Image src="/src/assets/settings.svg" alt="Settings Icon" />}>
      <Stack gap="xl">
        {/* <Switch
        label="Show chords"
        disabled={!settings}
        checked={settings?.show_chords ?? false}
        onChange={setShowChords}
        /> */}
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
            setAutoScrollSpeed(speed, AutoScrollInterval);
          }}
          value={settings?.auto_scroll_speed ?? 0}
        />
      </Stack>
    </Dropdown>
  );
}

function SongSettings() {
  const settings = useSignal(Signals.applySongSettings);

  useEffect(() => {
    console.debug("SongSettings mounted");
    if (!settings) {
      SettingsService.load(SongSettingsDto)
        .then((loadedSettings) => {
          if (loadedSettings) {
            console.log("Song settings loaded");
            Signals.applySongSettings.set(loadedSettings);
          } else {
            console.log("Song settings created");
            const newSettings = new SongSettingsDto();
            newSettings.auto_scroll_speed = AutoScrollSpeed;
            newSettings.auto_scroll_interval = AutoScrollInterval;
            newSettings.auto_scroll = AutoScrollEnabled;

            Signals.applySongSettings.set(newSettings);
            SettingsService.save(newSettings).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [settings]);

  const { setCenterContent, setRightContent } = useHeader();

  // Set header content when component mounts
  useEffect(() => {
    setCenterContent(<PlayStop />);
    setRightContent(<FullSettings />);

    // Clean up when component unmounts
    return () => {
      setCenterContent(null);
      setRightContent(null);
    };
  }, [setCenterContent, setRightContent]);

  return <></>;
}

export default SongSettings;
