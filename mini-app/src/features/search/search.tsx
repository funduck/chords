import { useEffect, useState } from "react";

import { SongDescrDto, SongService } from "@src/services/song.service";

import List from "@components/list";
import Section from "@components/section";
import Title from "@components/title";

import SearchSongListItem from "./search-song-list-item";

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
