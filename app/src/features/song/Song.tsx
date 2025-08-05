import { Box, Divider, ScrollArea } from "@mantine/core";
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
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }}>
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          style={{
            display: "flex",
            flexGrow: 1,
            paddingTop: "20px",
          }}
        >
          <Box key="song">Song #{song?.id || songId}</Box>
          {song && <SongCreators song={song} />}
          <Divider my="md" />
          <Box key="song_editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={true} />
          </Box>
          <Box key="song_viewer" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transpose} fontSize={fontSize} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
