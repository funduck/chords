import { useEffect, useState } from "react";

import { SongDescrDto, SongService } from "@src/services/song.service";

import Stack from "@components/Stack";
import Section from "@components/section";

import SearchSongListItem from "./SearchSongListItem";

function Search() {
  let [songs, setSongs] = useState<SongDescrDto[] | null>(null);

  useEffect(() => {
    if (!songs) {
      SongService.listSongs().then(setSongs);
    }
  }, []);

  if (!songs) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Stack>
          {songs.map((song) => (
            <SearchSongListItem key={song.id} song={song} />
          ))}
        </Stack>
      </Section>
    </>
  );
}

export default Search;
