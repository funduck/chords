import { Box, Group, Select, Switch } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

import { SearchSongsRequest } from "@generated/api";

import PageTop from "@src/components/PageTop";
import { useAccountContext } from "@src/features/account/AccountContext";
import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import PublicSearchDisclaimer from "./PublicSearchDisclaimer";
import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchResetArtist from "./SearchResetArtist";
import SearchSongListItem from "./SearchSongListItem";
import { deriveLibraryFilter, useLibraryOptions } from "./libraryFilter";

const LIBRARY_PREF_KEY = "search-songs-preferences-library";

function SearchSongs({ artistId }: { artistId?: number }) {
  const songsApi = useSongsApi();
  const { collections } = useAccountContext();

  // Initialize scroll position management
  useScrollPosition();

  const { updateSearchState } = useSearchSongsContext();

  useEffect(() => {
    // Reset search state when component mounts
    updateSearchState({
      cursorAfter: undefined,
      cursorBefore: undefined,
      loadingMore: false,
      searching: true,
      query: "",
    });
  }, [songsApi]);

  const [librarySel, setLibrarySel] = useState<string>(
    () => localStorage.getItem(LIBRARY_PREF_KEY) || "my",
  );
  const [byLyrics, setByLyrics] = useState(() => {
    const saved = localStorage.getItem("search-songs-preferences-byLyrics");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const libraryOptions = useLibraryOptions(collections);
  // Fall back to "my" if the selected shared collection was revoked.
  const effectiveSel =
    collections === null || libraryOptions.some((o) => o.value === librarySel) ? librarySel : "my";
  const { libraryType, ownerId } = deriveLibraryFilter(effectiveSel);

  const searchMethod = useCallback(
    (params: SearchSongsRequest) =>
      songsApi!.searchSongs({
        request: {
          ...params.request,
          artist_id: artistId || undefined,
          library_type: libraryType,
          owner_id: ownerId,
          by_lyrics: byLyrics,
        },
      }),
    [songsApi, artistId, libraryType, ownerId, byLyrics],
  );

  if (!songsApi) {
    return <div>Loading...</div>;
  }

  return (
    <Box mt="xl">
      <PageTop title="Search Songs" ml={0} />

      <SearchResetArtist />

      <SearchEntities
        useSearchContext={useSearchSongsContext}
        searchMethod={searchMethod}
        ListItemComponent={SearchSongListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Song by Title or Lyrics"
        entityName="songs"
        afterQueryInput={
          <Box>
            <Group gap="xl" align="flex-end" wrap={"wrap"}>
              <Group align="flex-end" gap="sm">
                <Select
                  data={libraryOptions}
                  value={effectiveSel}
                  onChange={(value) => {
                    const newValue = value || "my";
                    setLibrarySel(newValue);
                    localStorage.setItem(LIBRARY_PREF_KEY, newValue);
                  }}
                  allowDeselect={false}
                  comboboxProps={{ withinPortal: true }}
                  w={220}
                />
                {effectiveSel === "public" && <PublicSearchDisclaimer />}
              </Group>
              <Switch
                mb={6}
                label="By lyrics"
                checked={byLyrics}
                onChange={(e) => {
                  const newValue = e.currentTarget.checked;
                  setByLyrics(newValue);
                  localStorage.setItem("search-songs-preferences-byLyrics", JSON.stringify(newValue));
                }}
              />
            </Group>
          </Box>
        }
      />
    </Box>
  );
}

export default SearchSongs;
