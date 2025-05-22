import { SongDto, SongService } from "@src/services/song.service";
import { useEffect, useState, useRef } from "react";
import { Accordion, Divider, List, Section, Title } from "@telegram-apps/telegram-ui";
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

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title
        style={{
          background: "var(--tg-bg-color)",
        }}
      >
        {song.title} ({song.artist})
      </Title>
      <Divider />

      <List
        style={{
          background: "var(--tg-bg-color)",
        }}
      >
        <Accordion
          onChange={(e) => {
            setSettingsExpanded(e);
          }}
          expanded={settingsExpanded}
        >
          <Accordion.Summary>Settings</Accordion.Summary>
          <Accordion.Content>
            <SongSettingsControl />
          </Accordion.Content>
        </Accordion>

        <div ref={songContainerRef} style={{ overflowY: "auto", maxHeight: "70vh" }}>
          <Section>
            {song.lines.map((line, index) => (
              <SongLine key={index} line={line} />
            ))}
          </Section>
        </div>
      </List>
    </>
  );
}

export default Song;
