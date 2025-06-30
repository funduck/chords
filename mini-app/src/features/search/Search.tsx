import { Button, Flex, Pagination, Space } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { LibraryApiContext } from "@src/hooks/Api";

import QueryInput from "@components/QueryInput";
import Stack from "@components/Stack";
import Section from "@components/section";

import { useSearchContext } from "./SearchContext";
import SearchSongListItem from "./SearchSongListItem";

function Search() {
  const byLyrics = true; // This can be set based on tier

  const libraryApi = useContext(LibraryApiContext);
  const { searchState, updateSearchState } = useSearchContext();
  const [searching, setSearching] = useState<boolean>(false);

  const handleSearch = () => {
    // Save to history using the QueryInput's method
    if ((QueryInput as any).saveToHistory) {
      (QueryInput as any).saveToHistory(searchState.query);
    }
    setSearching(true);
  };

  // Perform search when searching state changes and api is available
  useEffect(() => {
    if (searching && libraryApi) {
      libraryApi
        .searchPublicLibrary({
          request: {
            query: byLyrics ? undefined : searchState.query,
            query_lyrics: byLyrics ? searchState.query : undefined,
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
          // If nothing was found, remove the query from history
          if (searchState.currentPage == 1 && res.total == 0) {
            if ((QueryInput as any).removeFromHistory) {
              (QueryInput as any).removeFromHistory(searchState.query);
            }
          }
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, libraryApi]);

  if (!libraryApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Flex direction={"column"} gap="md">
          <QueryInput
            name={"search-query-input"}
            query={searchState.query}
            onQueryChange={(query) => updateSearchState({ query })}
            onSubmit={handleSearch}
            placeholder={byLyrics ? "Search by Title, Artist or Lyrics" : "Search by Title or Artist"}
          />

          <Button variant="outline" onClick={handleSearch} disabled={searching} loading={searching}>
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
                handleSearch();
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
