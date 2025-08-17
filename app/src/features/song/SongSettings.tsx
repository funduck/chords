import { Box, Button, Flex, Group, Stack, Text } from "@mantine/core";
import { IconEdit, IconEye, IconMinus, IconPlayerPlayFilled, IconPlus } from "@tabler/icons-react";
import { useEffect } from "react";

import { Config } from "@src/config";
import { useHeader } from "@src/hooks/Header";

import Slider from "@components/Slider";

import { useSongContext } from "./SongContext";

function round5(value) {
  return Math.min(Math.max(Math.round(value / 5) * 5, 1), 100);
}

function AutoScrollPlayStopSettings() {
  const { songState, updateAutoScrollOptions } = useSongContext();
  const enabled = songState.autoScrollOptions?.enabled ?? Config.AutoScrollEnabled;
  const speed = songState.autoScrollOptions?.speed ?? Config.AutoScrollSpeed;

  function setAutoScroll(value: boolean) {
    updateAutoScrollOptions({
      enabled: value,
    });
  }

  return (
    <>
      {enabled && (
        <Button c="primary" variant="subtle" onClick={() => updateAutoScrollOptions({ speed: round5(speed - 5) })}>
          <IconMinus />
        </Button>
      )}
      <Button variant="subtle" disabled={!songState} onClick={() => setAutoScroll(!enabled)}>
        {enabled ? (
          <Box c="primary" w={30} ta="center" style={enabled ? { borderRadius: "8px", border: "3px solid" } : {}}>
            <Text c="dimmed">{speed}</Text>
          </Box>
        ) : (
          <IconPlayerPlayFilled color="var(--mantine-color-text)" />
        )}
      </Button>
      {enabled && (
        <Button c="primary" variant="subtle" onClick={() => updateAutoScrollOptions({ speed: round5(speed + 5) })}>
          <IconPlus />
        </Button>
      )}
    </>
  );
}

function AutoScrollSpeedSettings() {
  const { songState, updateAutoScrollOptions } = useSongContext();
  const speed = songState.autoScrollOptions?.speed ?? Config.AutoScrollSpeed;

  return (
    <Slider
      label={`Auto scroll speed ${speed}`}
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

export function SongDisplaySettings() {
  const { songState, updateDisplayOptions } = useSongContext();
  const displayMode = songState.displayOptions?.mode || "render";

  const previewActive = songState && displayMode == "render";
  const editActive = songState && displayMode == "editor";

  return (
    <Stack>
      <Group align="center" wrap="nowrap">
        <Box>
          <Button
            w={60}
            m={0}
            p={0}
            variant="subtle"
            disabled={previewActive}
            onClick={() =>
              updateDisplayOptions({
                mode: displayMode == "render" ? "editor" : "render",
              })
            }
          >
            <IconEye size={24} color={previewActive ? "var(--mantine-color-text)" : "var(--mantine-color-dimmed)"} />
          </Button>
        </Box>
        <Box>
          <Text size="sm" c={previewActive ? "primary" : "dimmed"}>
            Preview mode. Song is rendered with chords and formatting applied.
          </Text>
        </Box>
      </Group>
      <Group align="center" wrap="nowrap">
        <Box>
          <Button
            w={60}
            m={0}
            p={0}
            variant="subtle"
            disabled={editActive}
            onClick={() =>
              updateDisplayOptions({
                mode: displayMode == "render" ? "editor" : "render",
              })
            }
          >
            <IconEdit size={24} color={editActive ? "var(--mantine-color-text)" : "var(--mantine-color-dimmed)"} />
          </Button>
        </Box>
        <Box>
          <Text size="sm" c={editActive ? "primary" : "dimmed"}>
            Editor mode. Paste chordpro or foreign chord sheets, then format into ChordPro. Some manual tweaks may still
            be needed.
          </Text>
        </Box>
      </Group>
    </Stack>
  );
}

function SongKeySettings() {
  const { songState, updateDisplayOptions } = useSongContext();
  const transpose = songState.displayOptions?.transpose || 0;
  const fontSize = songState.displayOptions?.fontSize || 16;

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
        {/* <SongDisplaySettings /> */}
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
