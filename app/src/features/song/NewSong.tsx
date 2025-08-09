import { Anchor, Box, Divider, Group, ScrollArea, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconEdit, IconEye, IconMusicPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordProViewer";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings from "./SongSettings";

function NewSong() {
  const { songState, updateDisplayOptions } = useSongContext();
  const sheet = songState.newSheet || "";
  const displayMode = songState.displayOptions?.mode || "render";
  const transpose = songState.displayOptions?.transpose || 0;
  const fontSize = songState.displayOptions?.fontSize || 16;

  const songViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sheet || sheet.length === 0) {
      updateDisplayOptions({ mode: "editor" });
    }
  }, [sheet]);

  return (
    <>
      <AutoScrollManager viewportRef={songViewportRef} />
      <ChordDisplayManager />
      <SongSettings />
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }} mt="md">
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          <Box ta="center" mb="xl">
            <Title order={2} c="primary" mb={4}>
              <IconMusicPlus size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> New Song
            </Title>
            <Text c="dimmed">
              Create a new chord sheet in{" "}
              <Anchor href="https://www.chordpro.org/chordpro/chordpro-introduction/" target="_blank">
                ChordPro
              </Anchor>{" "}
              format.
            </Text>
          </Box>
          <Stack gap={6}>
            <Group gap="sm" wrap="nowrap"></Group>
            <Group align="flex-start" gap={8} wrap="nowrap">
              <ThemeIcon variant="light" size={26} radius="md" c="gray">
                <IconEdit size={16} />
              </ThemeIcon>
              <Text size="sm">
                Paste plain lyrics or foreign chord sheets, then tidy them into proper ChordPro. Some manual tweaks may
                still be needed.
              </Text>
            </Group>
            <Group align="flex-start" gap={8} wrap="nowrap">
              <ThemeIcon variant="light" size={26} radius="md" c="gray">
                <IconEye size={16} />
              </ThemeIcon>
              <Text size="sm">
                Switch to Preview to see rendered chords above lyrics, adjust transpose & font size before saving.
              </Text>
            </Group>
          </Stack>
          <Divider my="md" />
          <Box key="editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={false} />
          </Box>
          <Box key="render" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transpose} fontSize={fontSize} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default NewSong;
