import { Box, Flex, ScrollArea, Space, Text } from "@mantine/core";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordProViewer";
import PageTop from "@src/components/PageTop";
import SongCreators from "@src/components/SongCreators";
import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings, { SongDisplaySettings } from "./SongSettings";

function Song() {
  const { loadedSong, songSheet, displayOptions, loadSong } = useSongContext();
  const songApi = useSongsApi();
  const song = loadedSong;
  const sheet = songSheet || song?.sheet || "";
  const displayMode = displayOptions?.mode || "render";
  const transpose = displayOptions?.transpose || 0;
  const fontSize = displayOptions?.fontSize || 16;

  // Handle routing
  const { songId } = useParams<{ songId: string }>();
  useEffect(() => {
    if (songApi && songId && songId !== loadedSong?.id?.toString()) {
      loadSong(parseInt(songId, 10));
    }
  }, [songId, loadedSong, loadSong, songApi]);

  const songViewportRef = useRef<HTMLDivElement>(null);

  useScrollPosition();

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
              title={song?.title}
              description={
                song && (
                  <Text c="dimmed" component="span">
                    <SongCreators song={song} inGroup={false} />
                  </Text>
                )
              }
            />
            <SongDisplaySettings />
          </Flex>
          <Space h="xl" />
          <Box key="song_editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={true} />
          </Box>
          <Box key="song_viewer" ml="sm" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transpose} fontSize={fontSize} active={displayMode == "render"} />
          </Box>
          <Box
            h={
              (sheet.length * 1000) /
              ((songViewportRef.current?.clientHeight ?? 0) + (songViewportRef.current?.clientWidth ?? 0) || 1000)
            }
          ></Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
