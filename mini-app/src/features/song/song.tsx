import { SongDto, SongService } from "@src/services/song.service";
import { useEffect, useState } from "react";
import { Divider, Title } from "@telegram-apps/telegram-ui";
import { Signals } from "@src/signals-registry";
import { useParams } from "react-router";
import { useSignal } from "@telegram-apps/sdk-react";
import SongLine from "./song-line";

function Song() {
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

  if (!song) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title>
        {song.title} by {song.artist}
      </Title>
      <Divider />

      {song.lines.map((line, index) => (
        <SongLine key={index} line={line} />
      ))}
    </>
  );
}

export default Song;
