import { Box, Button, Flex, Text } from "@mantine/core";
import { IconEdit, IconEye, IconMinus, IconPlayerPlayFilled, IconPlayerStop, IconPlus } from "@tabler/icons-react";
import { useEffect } from "react";

import { Config } from "@src/config";
import { useHeader } from "@src/hooks/Header";

import Slider from "@components/Slider";

import { useSongContext } from "./SongContext";

function AutoScrollPlayStopSettings() {
  const { songState, updateAutoScrollOptions } = useSongContext();
  const enabled = songState.autoScrollOptions?.enabled ?? Config.AutoScrollEnabled;

  function setAutoScroll(value: boolean) {
    updateAutoScrollOptions({
      enabled: value,
    });
  }

  return (
    <Button variant="subtle" disabled={!songState} onClick={() => setAutoScroll(!enabled)}>
      {enabled ? (
        <IconPlayerStop color="var(--mantine-color-text)" />
      ) : (
        <IconPlayerPlayFilled color="var(--mantine-color-text)" />
      )}
    </Button>
  );
}

function AutoScrollSpeedSettings() {
  const { songState, updateAutoScrollOptions } = useSongContext();
  const speed = songState.autoScrollOptions?.speed ?? Config.AutoScrollSpeed;

  return (
    <Slider
      label="Auto scroll speed"
      min={1}
      disabled={!songState.autoScrollOptions}
      onChange={(e) => {
        const speed = e;
        updateAutoScrollOptions({
          speed,
          interval: Config.AutoScrollInterval,
        });
      }}
      value={speed}
    />
  );
}

function SongDisplaySettings() {
  const { songState, updateDisplayOptions } = useSongContext();
  const displayMode = songState.displayOptions?.mode || "render";

  return (
    <Button
      variant="subtle"
      disabled={!songState}
      onClick={() =>
        updateDisplayOptions({
          mode: displayMode == "render" ? "editor" : "render",
        })
      }
    >
      {displayMode == "editor" ? (
        <IconEye color="var(--mantine-color-text)" />
      ) : (
        <IconEdit color="var(--mantine-color-text)" />
      )}
    </Button>
  );
}

function SongKeySettings() {
  const { songState, updateDisplayOptions } = useSongContext();
  const transpose = songState.displayOptions?.transpose || 0;
  const fontSize = songState.displayOptions?.fontSize || 10;

  return (
    <Box>
      <Flex direction="row" m={"xs"} ta={"center"} align="center">
        <Text>Transpose</Text>
        <Button variant="subtle" onClick={() => updateDisplayOptions({ transpose: transpose - 1 })}>
          <IconMinus />
        </Button>
        <Text>
          <b>{transpose}</b>
        </Text>
        <Button variant="subtle" onClick={() => updateDisplayOptions({ transpose: transpose + 1 })}>
          <IconPlus />
        </Button>
      </Flex>
      <Flex direction="row" m={"xs"} ta={"center"} align="center">
        <Text>Font size</Text>
        <Button variant="subtle" onClick={() => updateDisplayOptions({ fontSize: fontSize - 1 })}>
          <IconMinus />
        </Button>
        <Text>
          <b>{fontSize}</b>
        </Text>
        <Button variant="subtle" onClick={() => updateDisplayOptions({ fontSize: fontSize + 1 })}>
          <IconPlus />
        </Button>
      </Flex>
    </Box>
  );
}

function SongSettings() {
  const { setCenterContent, setSettingsContent } = useHeader();

  // Set header content when component mounts
  useEffect(() => {
    setCenterContent(
      <Flex direction="row" ta={"center"} align="center">
        <AutoScrollPlayStopSettings />
        <SongDisplaySettings />
      </Flex>,
    );

    setSettingsContent([<AutoScrollSpeedSettings />, <SongKeySettings />]);

    // Clean up when component unmounts
    return () => {
      setCenterContent(null);
      setSettingsContent([]);
    };
  }, [setCenterContent, setSettingsContent]);

  return <></>;
}

export default SongSettings;
