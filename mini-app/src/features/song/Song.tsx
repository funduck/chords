import { Anchor, Box, Divider, ScrollArea } from "@mantine/core";
import { useEffect, useRef } from "react";
import { useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordproViewer";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import AutoScrollManager from "./AutoScroll";
import { useSongContext } from "./SongContext";
import SongEditor from "./SongEditor";
import SongSettings from "./SongSettings";

function Song() {
  const { songState, loadSong } = useSongContext();
  const song = songState.loadedSong;
  const sheet = songState.songSheet || song?.sheet || "";
  const displayMode = songState.displayOptions?.mode || "render";
  const transposeSong = songState.displayOptions?.transpose || 0;

  // Handle routing
  const { songId } = useParams<{ songId: string }>();
  useEffect(() => {
    if (songId && songId !== songState.loadedSong?.id?.toString()) {
      loadSong(parseInt(songId, 10));
    }
  }, [songId, songState, loadSong]);

  const songViewportRef = useRef<HTMLDivElement>(null);

  useScrollPosition();

  const artistRefs =
    (song?.artists || song?.composers)?.map((a) => <Anchor href={RoutesEnum.SearchArtists(a.id)}>{a.name}</Anchor>) ||
    [];

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
          {artistRefs}
          <Divider my="md" />
          <Box hidden={displayMode == "render"}>
            <SongEditor currentSong={true} />
          </Box>
          <Box hidden={displayMode == "editor"}>
            <ChordProViewer sheet={sheet} transpose={transposeSong} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
