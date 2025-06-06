import { SongDescrDto, SongService } from "@src/services/song.service";
import { useEffect, useState } from "react";
import SearchSongListItem from "./search-song-list-item";
import { List, Section, Title } from "@telegram-apps/telegram-ui";
import Room from "../room/room";

function Search() {
  let [songs, setSongs] = useState<SongDescrDto[] | null>(null);

  useEffect(() => {
    SongService.listSongs().then(setSongs);
  });

  if (!songs) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Title>Room</Title>
        <List>
          <Room />
        </List>
      </Section>

      <Section>
        <Title>Song List</Title>
        <List>
          {songs.map((song) => (
            <SearchSongListItem key={song.id} song={song} />
          ))}
        </List>
      </Section>
    </>
  );
}

export default Search;
