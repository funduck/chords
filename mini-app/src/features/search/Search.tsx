import { useEffect, useState } from "react";

import { Signals } from "@src/services/signals-registry";
import { SongDescrDto, SongService } from "@src/services/song.service";

import Stack from "@components/Stack";
import Section from "@components/section";

import SearchSongListItem from "./SearchSongListItem";

function Search() {
  let [songs, setSongs] = useState<SongDescrDto[] | null>(null);

  useEffect(() => {
    SongService.listSongs().then(setSongs);
  });

  if (!songs) {
    return <div>Loading...</div>;
  }

  setTimeout(() => {
    Signals.pageTitle.set("Song List");
  }, 0);

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
