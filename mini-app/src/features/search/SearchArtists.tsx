import { Button, Flex, Space } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { ArtistsApiContext } from "@src/hooks/Api";

import QueryInput from "@components/QueryInput";
import Stack from "@components/Stack";

import SearchArtistListItem from "./SearchArtistListItem";
import { useSearchArtistsContext } from "./SearchContext";

function SearchArtists() {
  const artistsApi = useContext(ArtistsApiContext);

  const { searchState, updateSearchState } = useSearchArtistsContext();
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
    if (searching && artistsApi) {
      artistsApi
        .searchArtists({
          request: {
            query: searchState.query,
            limit: searchState.pageSize,
            cursor_after: searchState.cursorAfter,
            cursor_before: searchState.cursorBefore,
            return_rows: true,
            return_total: true,
          },
        })
        .then((res) => {
          updateSearchState({
            entities: res.artists!,
            totalPages: Math.ceil((res.total || 0) / searchState.pageSize),
            hasSearched: true,
          });
          // TODO fix
          // // If nothing was found, remove the query from history
          // if (searchState.currentPage == 1 && res.total == 0) {
          //   if ((QueryInput as any).removeFromHistory) {
          //     (QueryInput as any).removeFromHistory(searchState.query);
          //   }
          // }
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, artistsApi]);

  if (!artistsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Flex direction={"column"} gap="md">
        <QueryInput
          name={"search-query-input"}
          query={searchState.query}
          onQueryChange={(query) => updateSearchState({ query })}
          onSubmit={handleSearch}
          placeholder={"Search Name"}
        />

        <Button variant="outline" onClick={handleSearch} disabled={searching} loading={searching}>
          Find
        </Button>
      </Flex>

      <Space h="xl" />

      {!searching && searchState.entities && searchState.hasSearched && (
        <>
          <Stack>
            {searchState.entities.map((entity) => (
              <SearchArtistListItem key={entity.id} entity={entity} />
            ))}
          </Stack>
          {/* TODO fix */}
          {/* <Pagination
            total={searchState.totalPages}
            onChange={(page) => {
              updateSearchState({ currentPage: page });
              handleSearch();
            }}
            mt="sm"
          /> */}
        </>
      )}
    </>
  );
}

export default SearchArtists;
