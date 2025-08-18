import { Anchor, Box, Divider, ScrollArea, Text } from "@mantine/core";
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
      <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }} mt="md">
        <ScrollArea
          viewportRef={songViewportRef}
          type="always"
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        >
          <PageTop
            title={songTitle ? `Draft` : "New Song"}
            description={
              <Text c="dimmed" component="span">
                {songTitle ? (
                  <>
                    {songTitle.title || <Text c="orange">no title</Text>} by{" "}
                    {songTitle.artist || <Text c="orange">no artist</Text>}
                  </>
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
          <Divider my="md" />
          <SongDisplaySettings />
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
