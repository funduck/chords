import { Box, Divider, Group, ScrollArea, Space } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { SongEntity, SongsApiContext } from "@src/hooks/Api";
import { SettingsService } from "@src/services/settings.service";
import { Signals } from "@src/services/signals-registry";

import Chordpro from "@components/Chordpro";
import Dropdown from "@components/Dropdown";
import Stack from "@components/Stack";
import Text from "@components/Text";

import SongSettingsControl from "./SongSettings";
import { SongSettings } from "./settings";

function Song() {
  const room = useSignal(Signals.room);

  // GET SONG
  let { songId } = useParams();

  // Store songId in localStorage so app remembers it across sessions
  if (!songId) {
    songId = localStorage.getItem("songId") ?? "";
    if (songId) {
      console.log("Using songId from localStorage:", songId);
    } else {
      return <Text>No song selected. Please select a song from the list or set a default song in settings.</Text>;
    }
  } else {
    localStorage.setItem("songId", songId);
  }

  const settings = useSignal(Signals.applySongSettings);

  const songViewportRef = useRef<HTMLDivElement>(null);
  const [song, setSong] = useState<SongEntity | null>(null);
  const applySongSettings = useSignal(Signals.applySongSettings);
  const applySongScroll = useSignal(Signals.applySongScroll);

  // This flag prevents emitting scroll events we are applying scroll events from room
  const emitScrollEvent = useRef(true);

  // This is used to debounce the scroll events when user scrolls manually
  const emittingScrollTimeout = useRef(null as ReturnType<typeof setTimeout> | null);

  const songsApi = useContext(SongsApiContext);

  useEffect(() => {
    console.debug("Song component mounted, fetching song with ID:", songId);
    if (songId && songsApi) {
      songsApi
        .getSongByID({ id: parseInt(songId, 10) })
        .then(setSong)
        .catch(console.error);
    }
  }, [songsApi, songId]);

  useEffect(() => {
    if (!settings) {
      SettingsService.load(SongSettings)
        .then((loadedSettings) => {
          if (loadedSettings) {
            console.log("Song settings loaded");
            Signals.applySongSettings.set(loadedSettings);
          } else {
            console.log("Song settings created");
            const newSettings = new SongSettings();
            Signals.applySongSettings.set(newSettings);
            SettingsService.save(newSettings).catch(console.error);
          }
        })
        .catch(console.error);
    }
  }, []);

  // HANDLE SYNC SCROLLING IN ROOM
  // Auto scrolling
  useEffect(() => {
    if (
      songViewportRef.current &&
      applySongSettings?.auto_scroll &&
      applySongSettings?.auto_scroll_interval &&
      applySongSettings?.auto_scroll_speed
    ) {
      const scrollInterval = applySongSettings.auto_scroll_interval;
      let scrollSpeed = applySongSettings.auto_scroll_speed; // 1-100

      // Get font size in pixels
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      // Convert scroll speed from percentage to pixels
      scrollSpeed = 4 * Math.ceil((scrollSpeed / 100) * fontSize);

      console.debug("Auto-scrolling is enabled, starting interval", { scrollInterval, scrollSpeed });
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
    }, 10);
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

  return (
    <Box id="songbox" style={{ display: "flex", flex: 1, flexDirection: "column", height: "100%" }}>
      <Group justify="space-between" style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}>
        <Dropdown title="Settings">
          <SongSettingsControl />
        </Dropdown>
      </Group>

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
            <Chordpro sheet={song.sheet!} />
          </Box>
          <Box>
            <Divider />
            <Space h="md" />
            <Text style={{ fontStyle: "italic" }}>End</Text>
          </Box>
        </Stack>
      </ScrollArea>
    </Box>
  );
}

export default Song;
