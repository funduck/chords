import { Button, Flex, Space, TextInput } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { LibraryApiContext, SongInfoEntity } from "@src/hooks/Api";

import Stack from "@components/Stack";
import Section from "@components/section";

import SearchSongListItem from "./SearchSongListItem";

function Search() {
  let [songs, setSongs] = useState<SongInfoEntity[] | null>(null);
  const libraryApi = useContext(LibraryApiContext);

  const [query, setQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    if (searching && libraryApi) {
      libraryApi
        .searchPublicLibrary({
          request: {
            query,
            limit: 100,
            offset: 0,
          },
        })
        .then((res) => {
          setSongs(res.songs!);
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, query, libraryApi]);

  if (!libraryApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Flex direction={"column"} gap="md">
          <TextInput
            name="query"
            placeholder="Search by Title or Artist"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button onClick={() => setSearching(true)} disabled={searching} loading={searching}>
            Find
          </Button>
        </Flex>

        <Space h="xl" />

        {!searching && songs && (
          <Stack>
            {songs.map((song) => (
              <SearchSongListItem key={song.id} song={song} />
            ))}
          </Stack>
        )}
      </Section>
    </>
  );
}

export default Search;
