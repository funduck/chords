import { useEffect, useState } from "react";

import Stack from "@src/components/Stack";
import { Signals } from "@src/services/signals-registry";
import { SongDescrDto, SongService } from "@src/services/song.service";

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

  Signals.pageTitle.set("Song List");

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
