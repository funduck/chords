import { Group, Space } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { RoutesEnum } from "@src/Router";
import Dropdown from "@src/components/Dropdown";
import Stack from "@src/components/Stack";
import Title from "@src/components/Title";
import { Signals } from "@src/services/signals-registry";
import { SongDto, SongService } from "@src/services/song.service";

import Section from "@components/section";

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
      console.warn("No songId found in URL or localStorage, redirecting to Search.");
      const navigate = useNavigate();
      navigate(RoutesEnum.Search); // Redirect to search if no songId is provided
      return null; // Prevent further rendering
    }
  } else {
    localStorage.setItem("songId", songId);
  }

  // const songId = useSignal(Signals.applySongId);
  // if (paramsSongId && paramsSongId !== songId) {
  //   Signals.applySongId.set(paramsSongId);
  // }
  const [song, setSong] = useState<SongDto | null>(null);
  useEffect(() => {
    if (songId) {
      SongService.getSong(songId).then(setSong);
    }
  }, [songId]);

  // SETTINGS
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // AUTO SCROLL SECTION WITH SONG LINES
  const settings = useSignal(Signals.applySongSettings);
  const songContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (settings?.auto_scroll && songContainerRef.current) {
      const interval = setInterval(() => {
        songContainerRef.current?.scrollBy({ top: settings?.auto_scroll_speed ?? 1, behavior: "smooth" });
      }, settings?.auto_scroll_interval ?? 100);
      return () => clearInterval(interval);
    }
  }, [settings?.auto_scroll, settings?.auto_scroll_speed]);

  // ADJUST HEIGHT OF SECTION WITH SONG LINES
  const [sectionHeight, setSectionHeight] = useState<string>("20vh");
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
      if (ignoreScrollEvent.current || settings?.auto_scroll) {
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
  }, [song, songContainerRef.current, settings?.auto_scroll]);

  const applySongScroll = useSignal(Signals.applySongScroll);
  useEffect(() => {
    if (!songContainerRef.current) {
      console.error("Song container not found for scrolling");
      return;
    }
    if (applySongScroll !== null && !settings?.auto_scroll) {
      console.debug("Applying song scroll:", applySongScroll);
      // applySongScroll is a percentage (0-100)
      const scrollTop =
        (applySongScroll / 100) * (songContainerRef.current.scrollHeight - songContainerRef.current.clientHeight);
      ignoreScrollEvent.current = true;
      setTimeout(() => {
        ignoreScrollEvent.current = false;
      }, 1000); // Reset ignore after a short delay
      songContainerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [song, songContainerRef.current, applySongScroll, settings?.auto_scroll]);

  if (!song) {
    return <div>Loading...</div>;
  }

  Signals.pageTitle.set(`"${song.title}" by "${song.artist}"`);

  return (
    <div>
      <Group justify="space-between">
        <Dropdown
          title="Settings"
          onChange={() => {
            adjustSectionHeight();
          }}
        >
          <Dropdown.Item>
            <SongSettingsControl />
          </Dropdown.Item>
        </Dropdown>
      </Group>

      <Space h="xl" />

      <div ref={songContainerRef} style={{ overflowY: "scroll", maxHeight: sectionHeight }}>
        {song.lines.map((line, index) => (
          <SongLine key={index} line={line} />
        ))}
      </div>
    </div>
  );
}

export default Song;
