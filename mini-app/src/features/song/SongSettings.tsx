import { Box, Button, Flex, Select, Text } from "@mantine/core";
import { IconMinus, IconPlayerPlayFilled, IconPlayerStop, IconPlus } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

import Switch from "@src/components/Switch";
import { Config } from "@src/config";
import { useHeader } from "@src/hooks/Header";
import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Slider from "@components/Slider";

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
    <Flex direction="row" ta={"center"} align="center">
      <Button variant="subtle" disabled={!settings} onClick={() => setAutoScroll(!settings?.auto_scroll)}>
        {settings?.auto_scroll ? (
          <IconPlayerStop color="var(--mantine-color-text)" />
        ) : (
          <IconPlayerPlayFilled color="var(--mantine-color-text)" />
        )}
      </Button>
      <SongDisplaySettings />
    </Flex>
  );
}

function AutoScrollSettings() {
  const settings = useSignal(Signals.applySongSettings);

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
    <Slider
      label="Auto scroll speed"
      min={1}
      disabled={!settings}
      onChange={(e) => {
        const speed = e;
        setAutoScrollSpeed(speed, Config.AutoScrollInterval);
      }}
      value={settings?.auto_scroll_speed ?? 0}
    />
  );
}

function SongDisplaySettings() {
  const displayMode = useSignal(Signals.songOptionDisplayMode);

  return (
    <Switch
      label={"Editor mode"}
      checked={displayMode == "editor"}
      onChange={(e) => {
        Signals.songOptionDisplayMode.set(e ? "editor" : "song");
      }}
    />
  );
}

function SongKeySettings() {
  const transposeSong = useSignal(Signals.songOptionTranspose);

  return (
    <Flex direction="row" m={"xs"} ta={"center"} align="center">
      <Text>Transpose</Text>
      <Button variant="subtle" onClick={() => Signals.songOptionTranspose.set(transposeSong - 1)}>
        <IconMinus />
      </Button>
      <Text>
        <b>{transposeSong}</b>
      </Text>
      <Button variant="subtle" onClick={() => Signals.songOptionTranspose.set(transposeSong + 1)}>
        <IconPlus />
      </Button>
    </Flex>
  );
}

function SongSettings() {
  const settings = useSignal(Signals.applySongSettings);

  useEffect(() => {
    if (!settings) {
      SettingsService.load(SongSettingsDto)
        .then((loadedSettings) => {
          if (loadedSettings) {
            console.log("Song settings loaded");
            Signals.applySongSettings.set(loadedSettings);
          } else {
            console.log("Song settings created");
            const newSettings = new SongSettingsDto();
            newSettings.auto_scroll_speed = Config.AutoScrollSpeed;
            newSettings.auto_scroll_interval = Config.AutoScrollInterval;
            newSettings.auto_scroll = Config.AutoScrollEnabled;

            Signals.applySongSettings.set(newSettings);
            SettingsService.save(newSettings).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, [settings]);

  const { setCenterContent, setSettingsContent } = useHeader();

  // Set header content when component mounts
  useEffect(() => {
    setCenterContent(<ShortcutSettings />);
    setSettingsContent([<AutoScrollSettings />, <SongKeySettings />]);

    // Clean up when component unmounts
    return () => {
      setCenterContent(null);
      setSettingsContent([]);
    };
  }, [setCenterContent, setSettingsContent]);

  return <></>;
}

export default SongSettings;
