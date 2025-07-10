import { Box, Divider, ScrollArea, Space, Textarea } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import ChordDisplayManager from "@src/components/ChordDisplayManager";
import { SongEntity, SongsApiContext } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";
import { estimateFontSize } from "@src/utils/font";

import Chordpro from "@components/Chordpro";
import Stack from "@components/Stack";
import Text from "@components/Text";

import SongSettings from "./SongSettings";

function Song() {
  const room = useSignal(Signals.room);

  let { songId } = useParams<{ songId: string }>();
  const songsApi = useContext(SongsApiContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Store songId in localStorage so app remembers it across sessions
    if (!songId) {
      songId = localStorage.getItem("songId") ?? "";
      if (songId) {
        console.log("Using songId from localStorage:", songId);
        navigate(RoutesEnum.Songs(parseInt(songId!, 10)));
        return;
      }
    } else {
      localStorage.setItem("songId", songId);
    }
  }, [songId]);

  const songViewportRef = useRef<HTMLDivElement>(null);
  const song = useSignal(Signals.song);
  const applySongSettings = useSignal(Signals.applySongSettings);
  const applySongScroll = useSignal(Signals.applySongScroll);

  // Initialize scroll position management
  const { saveScrollPosition } = useScrollPosition(songViewportRef);

  // This flag prevents emitting scroll events we are applying scroll events from room
  const emitScrollEvent = useRef(true);

  // This is used to debounce the scroll events when user scrolls manually
  const emittingScrollTimeout = useRef(null as ReturnType<typeof setTimeout> | null);

  const showRawSong = useSignal(Signals.songOptionShowRaw);
  const transposeSong = useSignal(Signals.songOptionTranspose);

  useEffect(() => {
    if (songId && songsApi) {
      console.debug("Fetching song with ID:", songId);
      songsApi
        .getSongByID({ id: parseInt(songId, 10) })
        .then((s) => Signals.song.set(s))
        .catch(console.error);
    }
  }, [songsApi, songId]);

  // HANDLE SYNC SCROLLING IN ROOM
  // Auto scrolling
  useEffect(() => {
    if (
      songViewportRef.current &&
      applySongSettings?.auto_scroll &&
      applySongSettings?.auto_scroll_interval &&
      applySongSettings?.auto_scroll_speed
    ) {
      // Get font size in pixels
      const { height } = estimateFontSize({});

      const scrollInterval = applySongSettings.auto_scroll_interval;
      let scrollSpeed = Math.max(1, applySongSettings.auto_scroll_speed); // 1-100
      // Convert scroll speed from percentage to pixels
      scrollSpeed = Math.ceil((scrollSpeed * height) / 10);

      console.debug(
        "Auto-scrolling is enabled",
        [applySongSettings.auto_scroll_interval, applySongSettings.auto_scroll_speed],
        "starting interval",
        { scrollInterval, scrollSpeed },
      );
      const interval = setInterval(() => {
        if (!songViewportRef.current) {
          console.debug("Auto-scrolling: songViewportRef is null");
          return;
        }

        // Prevent emitting scroll events while auto-scrolling
        emitScrollEvent.current = false;
        songViewportRef.current.onscrollend = () => {
          setTimeout(() => {
            emitScrollEvent.current = true;
          }, 10);
        };

        songViewportRef.current.scrollBy({
          top: scrollSpeed,
          behavior: "smooth",
        });
      }, scrollInterval);
      return () => {
        console.debug("Auto-scrolling interval cleared");
        clearInterval(interval);
      };
    }
  }, [
    room,
    songViewportRef.current,
    applySongSettings?.auto_scroll,
    applySongSettings?.auto_scroll_interval,
    applySongSettings?.auto_scroll_speed,
  ]);
  // Emitting scroll events
  function onScrollPositionChange() {
    saveScrollPosition();

    if (!room) {
      return;
    }
    if (!songViewportRef.current) {
      console.error("Song container not found");
      return;
    }
    if (!emitScrollEvent.current) {
      return;
    }
    const scrollPercent =
      (songViewportRef.current!.scrollTop /
        (songViewportRef.current!.scrollHeight - songViewportRef.current!.clientHeight)) *
      100;

    // Debounce scroll events to avoid flooding the signal
    if (emittingScrollTimeout.current) {
      clearTimeout(emittingScrollTimeout.current);
      emittingScrollTimeout.current = null;
    }
    emittingScrollTimeout.current = setTimeout(() => {
      Signals.publishSongScroll.set(scrollPercent);
      console.debug("Scroll event emitted:", scrollPercent);
    }, 50);
  }
  // Applying scroll events
  useEffect(() => {
    if (!room) {
      return;
    }
    if (applySongScroll == null) {
      return;
    }
    if (!songViewportRef.current) {
      console.debug("Apply scroll: song container not found");
      return;
    }

    console.debug("Applying scroll:", applySongScroll);

    // applySongScroll is a percentage (0-100)
    const scrollTop =
      (applySongScroll / 100) * (songViewportRef.current.scrollHeight - songViewportRef.current.clientHeight);

    // Prevent emitting scroll events while applying scroll
    emitScrollEvent.current = false;
    songViewportRef.current.onscrollend = () => {
      emitScrollEvent.current = true;
    };

    songViewportRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });

    Signals.applySongScroll.set(null); // Clear the signal after applying
  }, [room, song, songViewportRef.current, applySongScroll, applySongSettings?.auto_scroll]);

  if (!song) {
    return <div>Loading...</div>;
  }

  if (!songId) {
    return <Text>No song selected. Please select a song from the list or set a default song in settings.</Text>;
  }

  return (
    <>
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
          <Stack gap="xl">
            {/* <Box>
            <Title>{`"${song.title}" by "${song.artist}"`}</Title>
            <Space h="md" />
            <Divider />
          </Box> */}

            <Box>
              <Chordpro sheet={song.sheet!} raw={showRawSong} transpose={transposeSong} />
            </Box>
            <Box>
              <Divider />
              <Space h="md" />
              <Text style={{ fontStyle: "italic" }}>End</Text>
            </Box>
          </Stack>
        </ScrollArea>
      </Box>
    </>
  );
}

export default Song;
