import { Button, Flex, Group, RingProgress, Select, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconEdit,
  IconEye,
  IconMinus,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconPlus,
} from "@tabler/icons-react";
import { useEffect } from "react";

import { Config } from "@src/config";
import { useHeader } from "@src/hooks/Header";
import { useIsMobile } from "@src/hooks/isMobile";

import { useSongContext } from "./SongContext";

function round5(value) {
  return Math.min(Math.max(Math.round(value / 5) * 5, 1), 100);
}

function AutoScrollPlayStopSettings() {
  const { autoScrollOptions, updateAutoScrollOptions } = useSongContext();
  const enabled = autoScrollOptions?.enabled ?? Config.AutoScrollEnabled;
  const speed = autoScrollOptions?.speed ?? Config.AutoScrollSpeed;

  function setAutoScroll(value: boolean) {
    updateAutoScrollOptions({
      enabled: value,
    });
  }

  return (
    <Group>
      {enabled && (
        <Button
          p={0}
          c="primary"
          variant="subtle"
          onClick={() => updateAutoScrollOptions({ speed: round5(speed - 10) })}
        >
          <IconMinus />
        </Button>
      )}
      {enabled ? (
        <RingProgress
          size={50}
          thickness={2}
          sections={[
            {
              value: speed,
              color: "primary",
            },
          ]}
          label={
            <Button p={0} variant="subtle" disabled={false} onClick={() => setAutoScroll(false)}>
              <IconPlayerStopFilled color="var(--mantine-color-text)" />
            </Button>
          }
        />
      ) : null}
      {!enabled && (
        <Button variant="subtle" disabled={false} onClick={() => setAutoScroll(true)}>
          <IconPlayerPlayFilled color="var(--mantine-color-text)" />
        </Button>
      )}
      {enabled && (
        <Button
          p={0}
          c="primary"
          variant="subtle"
          onClick={() => updateAutoScrollOptions({ speed: round5(speed + 10) })}
        >
          <IconPlus />
        </Button>
      )}
    </Group>
  );
}

export function SongDisplaySettings() {
  const { displayOptions, updateDisplayOptions } = useSongContext();
  const displayMode = displayOptions?.mode || "render";

  const [dropdownOpened, { toggle }] = useDisclosure();

  const isMobile = useIsMobile();

  const switchBtn =
    displayMode == "editor" ? (
      <Button p={0} variant="transparent" c="primary" onClick={() => updateDisplayOptions({ mode: "render" })}>
        <IconEye />
      </Button>
    ) : (
      <Button p={0} variant="transparent" c="primary" onClick={() => updateDisplayOptions({ mode: "editor" })}>
        <IconEdit />
      </Button>
    );
  const selectBtn = (
    <Select
      value={displayMode}
      onChange={(value) => {
        updateDisplayOptions({
          mode: value as "render" | "editor",
        });
        toggle();
      }}
      data={[
        {
          value: "render",
          label: !dropdownOpened ? "Preview" : "Preview mode.Song is rendered with chords and formatting applied",
        },
        {
          value: "editor",
          label: !dropdownOpened
            ? "Editor"
            : "Editor mode. Paste ChordPro or foreign chord sheets and format to ChordPro. Some manual tweaks may still be needed.",
        },
      ]}
      onClick={toggle}
      dropdownOpened={dropdownOpened}
      withScrollArea={false}
    />
  );

  return isMobile ? (
    <Group>
      {selectBtn}
      {switchBtn}
    </Group>
  ) : (
    <Group>
      {selectBtn}
      {switchBtn}
    </Group>
  );
}

function SongKeySettings() {
  const { displayOptions, updateDisplayOptions } = useSongContext();
  const transpose = displayOptions?.transpose || 0;
  const fontSize = displayOptions?.fontSize || 16;

  return (
    <table>
      <tr>
        <td>
          <Text mr="sm">Transpose</Text>
        </td>
        <td>
          <Group>
            <Button p={0} variant="subtle" onClick={() => updateDisplayOptions({ transpose: transpose - 1 })}>
              <IconMinus />
            </Button>
            <Text w={10}>
              <b>{transpose}</b>
            </Text>
            <Button p={0} variant="subtle" onClick={() => updateDisplayOptions({ transpose: transpose + 1 })}>
              <IconPlus />
            </Button>
          </Group>
        </td>
      </tr>
      <tr>
        <td>
          <Text mr="sm">Font size</Text>
        </td>
        <td>
          <Group>
            <Button p={0} variant="subtle" onClick={() => updateDisplayOptions({ fontSize: fontSize - 1 })}>
              <IconMinus />
            </Button>
            <Text w={10}>
              <b>{fontSize}</b>
            </Text>
            <Button p={0} variant="subtle" onClick={() => updateDisplayOptions({ fontSize: fontSize + 1 })}>
              <IconPlus />
            </Button>
          </Group>
        </td>
      </tr>
    </table>
  );
}

function SongSettings() {
  const { setCenterContent, setSettingsContent } = useHeader();

  // Set header content when component mounts
  useEffect(() => {
    setCenterContent(
      <Flex direction="row" ta={"center"} align="center">
        <AutoScrollPlayStopSettings />
      </Flex>,
    );

    setSettingsContent([<SongKeySettings />]);

    // Clean up when component unmounts
    return () => {
      setCenterContent(null);
      setSettingsContent([]);
    };
  }, [setCenterContent, setSettingsContent]);

  return <></>;
}

export default SongSettings;
