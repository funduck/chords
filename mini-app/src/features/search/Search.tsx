import { Button, CloseButton, Combobox, Flex, Pagination, Space, TextInput, useCombobox } from "@mantine/core";
import { useContext, useEffect, useState } from "react";

import { LibraryApiContext } from "@src/hooks/Api";

import Stack from "@components/Stack";
import Section from "@components/section";

import { useSearchContext } from "./SearchContext";
import SearchSongListItem from "./SearchSongListItem";

function Search() {
  const libraryApi = useContext(LibraryApiContext);
  const { searchState, updateSearchState } = useSearchContext();

  // TODO eliminate this state and use searchState directly
  const [searching, setSearching] = useState<boolean>(false);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Save search to history
  const saveToHistory = (query: string) => {
    if (!query.trim()) return;

    const updatedHistory = [query, ...searchHistory.filter((item) => item !== query)].slice(0, 10);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };
  const removeFromHistory = (query: string) => {
    if (!searchHistory) return;

    const updatedHistory = searchHistory.filter((item) => item !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
  };

  const handleSearch = () => {
    saveToHistory(searchState.query);
    setSearching(true);
  };

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Perform search when searching state changes and api is available
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
          // If nothing was found, remove the query from history
          if (searchState.currentPage == 1 && res.total == 0) {
            removeFromHistory(searchState.query);
          }
        })
        .catch(console.error)
        .finally(() => {
          setSearching(false);
        });
    }
  }, [searching, libraryApi]);

  const combobox = useCombobox();
  const shouldFilterOptions = !searchHistory.some((item) => item === searchState.query);
  const filteredOptions = shouldFilterOptions
    ? searchHistory.filter((item) => item.toLowerCase().includes(searchState.query.toLowerCase().trim()))
    : searchHistory;
  const searchHistoryOptions = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  if (!libraryApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Section>
        <Flex direction={"column"} gap="md">
          <Combobox
            onOptionSubmit={(optionValue) => {
              updateSearchState({ query: optionValue });
              combobox.closeDropdown();
              handleSearch();
            }}
            store={combobox}
            withinPortal={false}
          >
            <Combobox.Target>
              <TextInput
                name="query"
                placeholder="Search by Title or Artist"
                value={searchState.query}
                onChange={(event) => {
                  updateSearchState({ query: event.currentTarget.value });
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                }}
                onClick={() => combobox.openDropdown()}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                rightSection={
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() =>
                      updateSearchState({
                        query: "",
                      })
                    }
                    style={{ display: searchState.query ? undefined : "none" }}
                  />
                }
              />
            </Combobox.Target>

            {searchHistoryOptions.length > 0 && (
              <Combobox.Dropdown>
                <Combobox.Options>{searchHistoryOptions}</Combobox.Options>
              </Combobox.Dropdown>
            )}
          </Combobox>

          <Button onClick={handleSearch} disabled={searching} loading={searching}>
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
