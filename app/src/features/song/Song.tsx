import { Anchor, Box, Divider, ScrollArea } from "@mantine/core";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import ChordDisplayManager from "@src/components/ChordDisplayManager";
import ChordProViewer from "@src/components/ChordproViewer";
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
  const transposeSong = songState.displayOptions?.transpose || 0;

  // Handle routing
  const { songId } = useParams<{ songId: string }>();
  useEffect(() => {
    if (songApi && songId && songId !== songState.loadedSong?.id?.toString()) {
      loadSong(parseInt(songId, 10));
    }
  }, [songId, songState, loadSong, songApi]);

  const songViewportRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  useScrollPosition();

  const artistRefs =
    song?.artists?.map((a) => (
      <Anchor
        key={a.id}
        onClick={(e) => {
          e.preventDefault();
          navigate(RoutesEnum.SearchArtists(a.id));
        }}
        href={RoutesEnum.SearchArtists(a.id)}
      >
        {a.name}
      </Anchor>
    )) || [];
  const composerRefs =
    song?.composers?.map((a) => (
      <Anchor
        key={a.id}
        onClick={(e) => {
          e.preventDefault();
          navigate(RoutesEnum.SearchArtists(a.id));
        }}
        href={RoutesEnum.SearchArtists(a.id)}
      >
        {a.name}
      </Anchor>
    )) || [];

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
          {artistRefs.length > 0 && <Box key="artists">Artists: {artistRefs}</Box>}
          {composerRefs.length > 0 && <Box key="composers">Composers: {composerRefs}</Box>}
          <Divider my="md" />
          <Box key="song_editor" hidden={displayMode != "editor"}>
            <SongEditor currentSong={true} />
          </Box>
          <Box key="song_viewer" hidden={displayMode != "render"}>
            <ChordProViewer sheet={sheet} transpose={transposeSong} active={displayMode == "render"} />
          </Box>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
