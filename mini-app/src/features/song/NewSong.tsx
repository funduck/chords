import { Box, ScrollArea } from "@mantine/core";
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

  let onScrollPositionChange;
  const autoScrollManager = (
    <AutoScrollManager
      viewportRef={songViewportRef}
      onScrollPositionChangeInit={(fn) => (onScrollPositionChange = fn)}
    />
  );

  useEffect(() => {
    if (!sheet || sheet.length === 0) {
      updateDisplayOptions({ mode: "editor" });
    }
  }, [sheet]);

  return (
    <>
      {autoScrollManager}
      <ChordDisplayManager />
      <SongSettings />
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }}>
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          onScrollPositionChange={onScrollPositionChange}
          style={{
            display: "flex",
            flexGrow: 1,
            paddingTop: "20px",
          }}
        >
          {displayMode == "render" && <ChordProViewer sheet={sheet} transpose={transposeSong} />}
          {displayMode == "editor" && <SongEditor currentSong={false} />}
        </ScrollArea>
      </Box>
    </>
  );
}

export default NewSong;
