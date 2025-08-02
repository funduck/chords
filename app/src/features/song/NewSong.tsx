import { Box, Divider, ScrollArea } from "@mantine/core";
import { useEffect, useRef } from "react";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordproViewer";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings from "./SongSettings";

function NewSong() {
  const { songState, updateDisplayOptions } = useSongContext();
  const sheet = songState.newSheet || "";
  const displayMode = songState.displayOptions?.mode || "render";
  const transposeSong = songState.displayOptions?.transpose || 0;

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
          <Box key="title">New Song</Box>
          <Divider my="md" />
          <Box key="editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={false} />
          </Box>
          <Box key="render" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transposeSong} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default NewSong;
