import { SongDto, SongService } from "@src/services/song.service";
import { useEffect, useState } from "react";
import { Cell, Divider, List, Section, Switch, Title } from "@telegram-apps/telegram-ui";
import { Signals } from "@src/signals-registry";
import { useParams } from "react-router";
import { useSignal } from "@telegram-apps/sdk-react";
import SongLine from "./song-line";
import { SettingsService } from "@src/services/settings.service";
import { SongSettings } from "./settings";

function Song() {
  const { songId: paramsSongId } = useParams();
  const songId = useSignal(Signals.selectedSongId);
  if (paramsSongId && paramsSongId !== songId) {
    Signals.selectedSongId.set(paramsSongId);
  }

  const settings = useSignal(Signals.settingsSong);
  useEffect(() => {
    if (!settings) {
      SettingsService.load(SongSettings).then((loadedSettings) => {
        if (loadedSettings) {
          console.log("Song settings loaded");
          Signals.settingsSong.set(loadedSettings);
        } else {
          const newSettings = new SongSettings();
          Signals.settingsSong.set(newSettings);
          SettingsService.save(newSettings).then(() => console.log("Song settings created"));
        }
      });
    }
  }, [settings]);
  function setShowChords(value: boolean) {
    if (settings) {
      const newSettings = settings.cloneWith({ showChords: value });
      Signals.settingsSong.set(newSettings);
      SettingsService.save(newSettings).then(() => console.log("Song settings updated"));
    }
  }

  const [song, setSong] = useState<SongDto | null>(null);
  useEffect(() => {
    if (songId) {
      SongService.getSong(songId).then(setSong);
    }
  }, [songId]);

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
          background: "var(--tgui--secondary_bg_color)",
        }}
      >
        <Section header="Settings">
          <Cell
            after={
              <Switch
                disabled={!settings}
                checked={settings?.showChords}
                onChange={(e) => {
                  setShowChords(e.target.checked);
                }}
              ></Switch>
            }
          >
            Show chords
          </Cell>
        </Section>

        <Section header="Song">
          {song.lines.map((line, index) => (
            <SongLine key={index} line={line} />
          ))}
        </Section>
      </List>
    </>
  );
}

export default Song;
