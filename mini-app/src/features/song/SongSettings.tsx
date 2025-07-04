import { Button, Menu } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStop, IconSettings, IconSettingsFilled } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";

import { AutoScrollEnabled, AutoScrollInterval, AutoScrollSpeed } from "@src/config";
import { useHeader } from "@src/hooks/Header";
import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Slider from "@components/Slider";
import Switch from "@components/Switch";

import { SongSettingsDto } from "./settings";

function ShortcutSettings() {
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
      {settings?.auto_scroll ? (
        <IconPlayerStop color="var(--mantine-color-text)" />
      ) : (
        <IconPlayerPlayFilled color="var(--mantine-color-text)" />
      )}
    </Button>
  );
}

function FullSettings() {
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

  const [opened, setOpened] = useState(false);

  return (
    <Menu shadow="md" width={200} withArrow onChange={(e) => setOpened(e)}>
      <Menu.Target>
        <Button variant="subtle">
          {opened ? (
            <IconSettingsFilled color="var(--mantine-color-text)" />
          ) : (
            <IconSettings color="var(--mantine-color-text)" />
          )}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {/* <Switch
        label="Show chords"
        disabled={!settings}
        checked={settings?.show_chords ?? false}
        onChange={setShowChords}
        /> */}
        <Menu.Item>
          <Switch
            label="Auto scroll"
            disabled={!settings}
            checked={settings?.auto_scroll ?? false}
            onChange={setAutoScroll}
          />
        </Menu.Item>
        <Menu.Item>
          <Slider
            label="Auto scroll speed"
            disabled={!settings}
            onChange={(e) => {
              const speed = e;
              setAutoScrollSpeed(speed, AutoScrollInterval);
            }}
            value={settings?.auto_scroll_speed ?? 0}
          />
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
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
    setCenterContent(<ShortcutSettings />);
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
