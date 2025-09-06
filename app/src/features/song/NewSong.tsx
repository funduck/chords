import { Anchor, Box, Flex, Group, ScrollArea, Space, Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordProViewer";
import PageTop from "@src/components/PageTop";
import { ChordProService } from "@src/services/chordpro/chordpro";
import { getSongArtist } from "@src/utils/song";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings, { SongDisplaySettings } from "./SongSettings";

function NewSong() {
  const { songState, updateDisplayOptions } = useSongContext();
  const sheet = songState.newSheet || "";
  const displayMode = songState.displayOptions?.mode || "render";
  const transpose = songState.displayOptions?.transpose || 0;
  const fontSize = songState.displayOptions?.fontSize || 16;

  const songViewportRef = useRef<HTMLDivElement>(null);

  const [songTitle, setSongTitle] = useState<{ title: string; artist: string | null } | null>(null);
  useEffect(() => {
    if (!sheet || sheet.length === 0) {
      updateDisplayOptions({ mode: "editor" });
    }

    const song = ChordProService.sheetToSong(sheet, {});
    if (!song) return;
    setSongTitle({
      title: song.title || "",
      artist: (getSongArtist(song) || []).join(", ") || "",
    });
  }, [sheet]);

  return (
    <>
      <AutoScrollManager viewportRef={songViewportRef} />
      <ChordDisplayManager />
      <SongSettings />
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }}>
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          <Flex direction={"column"} align={"start"} justify={"space-between"} gap="xl" mt="xl">
            <PageTop
              title={songTitle ? `Draft` : "New Song"}
              description={
                <Text c="dimmed" component="span">
                  {songTitle ? (
                    <Group>
                      <Text c="orange">{songTitle.title || "no title"}</Text>
                      by
                      <Text c="orange">{songTitle.artist || "no artist"}</Text>
                    </Group>
                  ) : (
                    <>
                      Create a new chord sheet in{" "}
                      <Anchor href="https://www.chordpro.org/chordpro/chordpro-introduction/" target="_blank">
                        ChordPro
                      </Anchor>{" "}
                      format.
                    </>
                  )}
                </Text>
              }
            />
            <SongDisplaySettings />
          </Flex>
          <Space h="xl" />
          <Box key="song_editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={false} />
          </Box>
          <Box key="song_viewer" ml="sm" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transpose} fontSize={fontSize} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default NewSong;
