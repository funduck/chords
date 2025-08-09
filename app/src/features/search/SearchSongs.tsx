import { Box, Group, Space, Switch, Text, Title } from "@mantine/core";
import { IconMusicSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { SearchSongsRequest } from "@generated/api";

import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import PublicSearchDisclaimer from "./PublicSearchDisclaimer";
import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchResetArtist from "./SearchResetArtist";
import SearchSongListItem from "./SearchSongListItem";

function SearchSongs({ artistId }: { artistId?: number }) {
  const songsApi = useSongsApi();

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

  const [inPrivateLibs, setInPrivateLibs] = useState(() => {
    const saved = localStorage.getItem("search-songs-preferences-inPrivateLibs");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [byLyrics, setByLyrics] = useState(() => {
    const saved = localStorage.getItem("search-songs-preferences-byLyrics");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const searchMethod = useCallback(
    (params: SearchSongsRequest) =>
      songsApi!.searchSongs({
        request: {
          ...params.request,
          artist_id: artistId || undefined,
          library_type: inPrivateLibs ? "private" : undefined,
          by_lyrics: byLyrics,
        },
      }),
    [songsApi, artistId, inPrivateLibs, byLyrics],
  );

  if (!songsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Box ta="center" mb="lg">
        <Title order={2} c="primary">
          <IconMusicSearch size={22} style={{ marginRight: 8, verticalAlign: "text-bottom" }} /> Search Songs
        </Title>
        <Space h="xs" />
        <Text c="dimmed" size="sm">
          Find songs by title or lyrics, in your library or public catalog.
        </Text>
      </Box>

      <SearchResetArtist />

      <SearchEntities
        useSearchContext={useSearchSongsContext}
        searchMethod={searchMethod}
        ListItemComponent={SearchSongListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Song by Title or Lyrics"
        entityName="songs"
        beforeQueryInput={
          <Box>
            {/* <Card padding="sm" radius="md" mb="md"> */}
            <Group gap="lg">
              <Switch
                label="By lyrics"
                checked={byLyrics}
                onChange={(e) => {
                  const newValue = e.currentTarget.checked;
                  setByLyrics(newValue);
                  localStorage.setItem("search-songs-preferences-byLyrics", JSON.stringify(newValue));
                }}
              />
              <Group>
                <Switch
                  label="In my library"
                  checked={inPrivateLibs}
                  onChange={(e) => {
                    const newValue = e.currentTarget.checked;
                    setInPrivateLibs(newValue);
                    localStorage.setItem("search-songs-preferences-inPrivateLibs", JSON.stringify(newValue));
                  }}
                />
                {!inPrivateLibs && <PublicSearchDisclaimer />}
              </Group>
            </Group>
            {/* </Card> */}
          </Box>
        }
      />
    </>
  );
}

export default SearchSongs;
