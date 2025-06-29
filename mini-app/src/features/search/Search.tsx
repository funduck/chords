import { Button, Flex, Pagination, Space, TextInput } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { LibraryApiContext } from "@src/hooks/Api";

import Stack from "@components/Stack";
import Section from "@components/section";

import { useSearchContext } from "./SearchContext";
import SearchSongListItem from "./SearchSongListItem";

function Search() {
  const libraryApi = useContext(LibraryApiContext);
  const { searchState, updateSearchState } = useSearchContext();

  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    if (searching && libraryApi) {
      libraryApi
        .searchPublicLibrary({
          request: {
            query: searchState.query,
            limit: searchState.pageSize,
            offset: searchState.pageSize * (searchState.currentPage - 1) || 0,
            return_rows: true,
            return_total: true,
          },
        })
        .then((res) => {
          updateSearchState({
            songs: res.songs!,
            totalPages: Math.ceil((res.total || 0) / searchState.pageSize),
            hasSearched: true,
          });
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, searchState.query, libraryApi, searchState.pageSize, searchState.currentPage]);

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
            value={searchState.query}
            onChange={(event) => updateSearchState({ query: event.target.value })}
          />
          <Button onClick={() => setSearching(true)} disabled={searching} loading={searching}>
            Find
          </Button>
        </Flex>

        <Space h="xl" />

        {!searching && searchState.songs && searchState.hasSearched && (
          <>
            <Stack>
              {searchState.songs.map((song) => (
                <SearchSongListItem key={song.id} song={song} />
              ))}
            </Stack>
            <Pagination
              total={searchState.totalPages}
              value={searchState.currentPage}
              onChange={(page) => {
                updateSearchState({ currentPage: page });
                setSearching(true);
              }}
              mt="sm"
            />
          </>
        )}
      </Section>
    </>
  );
}

export default Search;
