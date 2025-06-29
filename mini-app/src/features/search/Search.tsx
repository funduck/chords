import { useContext, useEffect, useState } from "react";

import { LibraryApiContext, SongInfoEntity } from "@src/hooks/Api";

import Stack from "@components/Stack";
import Section from "@components/section";

import SearchSongListItem from "./SearchSongListItem";

function Search() {
  let [songs, setSongs] = useState<SongInfoEntity[] | null>(null);
  const libraryApi = useContext(LibraryApiContext);

  useEffect(() => {
    if (!songs) {
      libraryApi
        ?.searchPublicLibrary({
          request: {
            query: "",
            limit: 100,
            offset: 0,
          },
        })
        .then((res) => {
          setSongs(res.songs!);
        });
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
