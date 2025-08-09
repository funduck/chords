import { Box, Divider, ScrollArea, Text, Title } from "@mantine/core";
import { IconMusic } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordProViewer";
import SongCreators from "@src/components/SongCreators";
import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings from "./SongSettings";

function Song() {
  const { songState, loadSong } = useSongContext();
  const songApi = useSongsApi();
  const song = songState.loadedSong;
  const sheet = songState.songSheet || song?.sheet || "";
  const displayMode = songState.displayOptions?.mode || "render";
  const transpose = songState.displayOptions?.transpose || 0;
  const fontSize = songState.displayOptions?.fontSize || 16;

  // Handle routing
  const { songId } = useParams<{ songId: string }>();
  useEffect(() => {
    if (songApi && songId && songId !== songState.loadedSong?.id?.toString()) {
      loadSong(parseInt(songId, 10));
    }
  }, [songId, songState, loadSong, songApi]);

  const songViewportRef = useRef<HTMLDivElement>(null);

  useScrollPosition();

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
            paddingTop: "5px",
          }}
        >
          <Box ta="center" mb="xl">
            <Title order={2} c="primary" mb={4}>
              <IconMusic size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> Play Song
            </Title>
            {song && (
              <>
                <Text c="dimmed">
                  "{song.title}" by
                  <SongCreators song={song} inGroup={false} />
                </Text>
              </>
            )}
          </Box>
          <Divider my="md" />
          <Box key="song_editor" ml="sm" hidden={displayMode != "editor"}>
            <SongEditor currentSong={true} />
          </Box>
          <Box key="song_viewer" ml="sm" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transpose} fontSize={fontSize} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
