import { Box, Divider, ScrollArea, Text, Title } from "@mantine/core";
import { IconMusicPlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordProViewer";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongEditorDescription from "./SongEditorDescription";
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
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }}>
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          <Box ta="center" mt="sm" mb="md">
            <Title order={2} c="primary" mb={4}>
              <IconMusicPlus size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> New Song
            </Title>
            <Text c="dimmed" size="sm">
              Create or paste a chord sheet. Toggle preview with the eye icon in header.
            </Text>
          </Box>
          <SongEditorDescription />
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
