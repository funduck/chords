import { Box, Divider, Group, Space } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import Dropdown from "@src/components/Dropdown";
import Stack from "@src/components/Stack";
import Text from "@src/components/Text";
import { Signals } from "@src/services/signals-registry";
import { SongDto, SongService } from "@src/services/song.service";

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

  const [song, setSong] = useState<SongDto | null>(null);

  const applySongSettings = useSignal(Signals.applySongSettings);
  const applySongScroll = useSignal(Signals.applySongScroll);

  const songContainerRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState<string>("20vh");

  useEffect(() => {
    if (songId) {
      SongService.getSong(songId).then(setSong);
    }
  }, [songId]);

  // AUTO SCROLL SECTION WITH SONG LINES
  useEffect(() => {
    if (applySongSettings?.auto_scroll && songContainerRef.current) {
      const interval = setInterval(() => {
        songContainerRef.current?.scrollBy({ top: applySongSettings?.auto_scroll_speed ?? 1, behavior: "smooth" });
      }, applySongSettings?.auto_scroll_interval ?? 100);
      return () => clearInterval(interval);
    }
  }, [applySongSettings?.auto_scroll, applySongSettings?.auto_scroll_speed]);

  // ADJUST HEIGHT OF SECTION WITH SONG LINES
  const tabBarHeight = 50; // Adjust this value based on your tab bar's height
  const adjustSectionHeightNow = () => {
    const songContainerStart = songContainerRef.current?.getBoundingClientRect().top ?? 0;
    const availableHeight = window.innerHeight - songContainerStart - tabBarHeight;
    setSectionHeight(`${availableHeight}px`);
  };
  const adjustSectionHeight = () => {
    setTimeout(() => {
      adjustSectionHeightNow();
    }, 100);
    setTimeout(() => {
      adjustSectionHeightNow();
    }, 500);
  };
  useEffect(() => {
    adjustSectionHeight();
  }, []);

  // HANDLE SYNC SCROLLING IN ROOM
  const ignoreScrollEvent = useRef(false);
  useEffect(() => {
    const screen = songContainerRef.current;
    if (!screen) {
      console.error("Song container not found");
      return;
    }
    function handleScroll() {
      // We ignore scroll events if auto-scroll is enabled or if we are applying a scroll event
      if (ignoreScrollEvent.current || applySongSettings?.auto_scroll) {
        return;
      }
      const scrollPercent = (screen!.scrollTop / (screen!.scrollHeight - screen!.clientHeight)) * 100;
      Signals.publishSongScroll.set(scrollPercent);
    }
    screen?.addEventListener("scroll", handleScroll);
    console.log("Scroll event listener added");
    return () => {
      screen?.removeEventListener("scroll", handleScroll);
    };
  }, [song, songContainerRef.current, applySongSettings?.auto_scroll]);

  useEffect(() => {
    if (!songContainerRef.current) {
      console.error("Song container not found for scrolling");
      return;
    }
    // If auto-scroll is enabled, we don't apply manual scroll
    if (applySongSettings?.auto_scroll) {
      return;
    }
    // If applySongScroll is null, we ignore it
    if (applySongScroll == null) {
      return;
    }

    console.debug("Applying song scroll:", applySongScroll);

    // applySongScroll is a percentage (0-100)
    const scrollTop =
      (applySongScroll / 100) * (songContainerRef.current.scrollHeight - songContainerRef.current.clientHeight);

    // Ignore scroll events for a short time not to emit the scroll events like it is manual scrolling
    ignoreScrollEvent.current = true;
    // Reset ignore after a short delay
    setTimeout(() => {
      ignoreScrollEvent.current = false;
    }, 1000);

    songContainerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, [song, songContainerRef.current, applySongScroll, applySongSettings?.auto_scroll]);

  if (!song) {
    return <div>Loading...</div>;
  }

  // Without setTimeout React throws an error that we are updating Router state while rendering Song
  setTimeout(() => {
    Signals.pageTitle.set(`"${song.title}" by "${song.artist}"`);
  }, 0);

  return (
    <div>
      <Group justify="space-between">
        <Dropdown
          title="Settings"
          onChange={() => {
            adjustSectionHeight();
          }}
        >
          <SongSettingsControl />
        </Dropdown>
      </Group>

      <Space h="xl" />

      <div
        ref={songContainerRef}
        style={{ backgroundColor: "Background", overflowY: "scroll", maxHeight: sectionHeight }}
      >
        <Stack gap="xl">
          <Box>
            {song.lines.map((line, index) => (
              <SongLine key={index} line={line} />
            ))}
          </Box>
          <Box>
            <Divider />
            <Space />
            <Text>End</Text>
          </Box>
        </Stack>
      </div>
    </div>
  );
}

export default Song;
