import { SongDto, SongService } from "@src/services/song.service";
import { useEffect, useState, useRef } from "react";
import { Accordion, Cell, Divider, Headline, LargeTitle, List, Section, Title } from "@telegram-apps/telegram-ui";
import { Signals } from "@src/signals-registry";
import { useParams } from "react-router";
import { useSignal } from "@telegram-apps/sdk-react";
import SongLine from "./song-line";
import SongSettingsControl from "./song-settings";

function Song() {
  // GET SONG
  const { songId: paramsSongId } = useParams();
  const songId = useSignal(Signals.selectedSongId);
  if (paramsSongId && paramsSongId !== songId) {
    Signals.selectedSongId.set(paramsSongId);
  }
  const [song, setSong] = useState<SongDto | null>(null);
  useEffect(() => {
    if (songId) {
      SongService.getSong(songId).then(setSong);
    }
  }, [songId]);

  // SETTINGS
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // AUTO SCROLL
  const settings = useSignal(Signals.settingsSong);
  const songContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (settings?.autoScroll && songContainerRef.current) {
      const interval = setInterval(() => {
        songContainerRef.current?.scrollBy({ top: settings?.autoScrollSpeed ?? 1, behavior: "smooth" });
      }, settings?.autoScrollInterval ?? 100);
      return () => clearInterval(interval);
    }
  }, [settings?.autoScroll, settings?.autoScrollSpeed]);

  const [sectionHeight, setSectionHeight] = useState<string>("20vh");
  const adjustSectionHeight = () => {
    const tabBarHeight = 50; // Adjust this value based on your tab bar's height
    // Get start of songContainerRef
    const songContainerStart = songContainerRef.current?.getBoundingClientRect().top ?? 0;
    const availableHeight = window.innerHeight - songContainerStart - tabBarHeight;
    setSectionHeight(`${availableHeight}px`);
  };

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title>
        <b>{song.title}</b> ({song.artist})
      </Title>

      <List>
        <Section>
          <Accordion
            onChange={(e) => {
              setSettingsExpanded(e);
              setTimeout(() => {
                adjustSectionHeight();
              }, 100);
              setTimeout(() => {
                adjustSectionHeight();
              }, 500);
            }}
            expanded={settingsExpanded}
          >
            <Accordion.Summary>Settings</Accordion.Summary>
            <Accordion.Content>
              <SongSettingsControl />
            </Accordion.Content>
          </Accordion>
        </Section>

        <Section>
          <div ref={songContainerRef} style={{ overflowY: "scroll", maxHeight: sectionHeight }}>
            {song.lines.map((line, index) => (
              <SongLine key={index} line={line} />
            ))}
          </div>
        </Section>
      </List>
    </>
  );
}

export default Song;
