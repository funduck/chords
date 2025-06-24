import { Box, Divider, Group, ScrollArea, Space } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { Signals } from "@src/services/signals-registry";
import { SongDto, SongService } from "@src/services/song.service";

import Dropdown from "@components/Dropdown";
import Stack from "@components/Stack";
import Text from "@components/Text";
import Title from "@components/Title";

import SongLine from "./SongLine";
import SongSettingsControl from "./SongSettings";

function Song() {
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

  const songViewportRef = useRef<HTMLDivElement>(null);
  const [song, setSong] = useState<SongDto | null>(null);
  const applySongSettings = useSignal(Signals.applySongSettings);
  const applySongScroll = useSignal(Signals.applySongScroll);

  useEffect(() => {
    if (songId) {
      SongService.getSong(songId).then(setSong).catch(console.error);
    }
  }, [songId]);

  // AUTO SCROLL SECTION WITH SONG LINES
  useEffect(() => {
    if (applySongSettings?.auto_scroll) {
      const scrollInterval = applySongSettings?.auto_scroll_interval ?? 100;
      let scrollSpeed = applySongSettings?.auto_scroll_speed ?? 1; // 1-100
      // Get font size in pixels
      const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      // Convert scroll speed from percentage to pixels
      scrollSpeed = (scrollSpeed / 100) * fontSize;
      console.debug("Auto-scrolling is enabled, starting interval", { scrollInterval, scrollSpeed });
      const interval = setInterval(() => {
        if (!songViewportRef.current) {
          console.debug("Auto-scrolling: songViewportRef is null");
          return;
        }
        const top = scrollSpeed; //(songViewportRef.current.scrollHeight * scrollSpeed) / 100;
        console.debug("Auto-scrolling by", top, "pixels");
        songViewportRef.current.scrollBy({ top, behavior: "smooth" });
      }, scrollInterval);
      return () => {
        console.debug("Auto-scrolling interval cleared");
        clearInterval(interval);
      };
    }
  }, [
    songViewportRef.current,
    applySongSettings?.auto_scroll,
    applySongSettings?.auto_scroll_interval,
    applySongSettings?.auto_scroll_speed,
  ]);

  // // HANDLE SYNC SCROLLING IN ROOM
  const ignoreScrollEvent = useRef(false);
  // useEffect(() => {
  //   const screen = songContainerRef.current;
  //   if (!screen) {
  //     console.error("Song container not found");
  //     return;
  //   }
  //   function handleScroll() {
  //     // We ignore scroll events if auto-scroll is enabled or if we are applying a scroll event
  //     if (ignoreScrollEvent.current || applySongSettings?.auto_scroll) {
  //       return;
  //     }
  //     const scrollPercent = (screen!.scrollTop / (screen!.scrollHeight - screen!.clientHeight)) * 100;
  //     Signals.publishSongScroll.set(scrollPercent);
  //   }
  //   screen?.addEventListener("scroll", handleScroll);
  //   console.log("Scroll event listener added");
  //   return () => {
  //     screen?.removeEventListener("scroll", handleScroll);
  //   };
  // }, [song, songContainerRef.current, applySongSettings?.auto_scroll]);

  useEffect(() => {
    // If auto-scroll is enabled, we don't apply manual scroll
    if (applySongSettings?.auto_scroll) {
      return;
    }
    // If applySongScroll is null, we ignore it
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

    // Ignore scroll events for a short time not to emit the scroll events like it is manual scrolling
    ignoreScrollEvent.current = true;
    // Reset ignore after a short delay
    setTimeout(() => {
      ignoreScrollEvent.current = false;
    }, 1000);

    songViewportRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, [song, songViewportRef.current, applySongScroll, applySongSettings?.auto_scroll]);

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Group justify="space-between" style={{ position: "fixed", top: "10px", right: "10px", zIndex: 1000 }}>
        <Dropdown title="Settings">
          <SongSettingsControl />
        </Dropdown>
      </Group>

      {/* <ScrollArea.Autosize viewportRef={songViewportRef} type="always" style={{ backgroundColor: "Background" }}> */}
      <div
        ref={songViewportRef}
        className="song-viewport"
        style={{
          overflowY: "auto",
          maxHeight: "80vh",
          paddingTop: "20px",
        }}
      >
        <Stack gap="xl">
          <Box>
            <Title>{`"${song.title}" by "${song.artist}"`}</Title>
            <Space h="md" />
            <Divider />
          </Box>

          <Box>
            {song.lines.map((line, index) => (
              <SongLine key={index} line={line} />
            ))}
          </Box>
          <Box>
            <Divider />
            <Space h="md" />
            <Text>End</Text>
          </Box>
        </Stack>
        {/* </ScrollArea.Autosize> */}
      </div>
    </Box>
  );
}

export default Song;
