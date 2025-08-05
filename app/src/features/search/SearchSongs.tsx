import { Group, Switch } from "@mantine/core";
import { useEffect, useState } from "react";

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

  if (!songsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SearchResetArtist />
      <Group>
        <Switch
          label="in my library"
          mb="md"
          checked={inPrivateLibs}
          onChange={(e) => {
            const newValue = e.currentTarget.checked;
            setInPrivateLibs(newValue);
            localStorage.setItem("search-songs-preferences-inPrivateLibs", JSON.stringify(newValue));
          }}
        />
        <Switch
          label="by lyrics"
          mb="md"
          checked={byLyrics}
          onChange={(e) => {
            const newValue = e.currentTarget.checked;
            setByLyrics(newValue);
            localStorage.setItem("search-songs-preferences-byLyrics", JSON.stringify(newValue));
          }}
        />
      </Group>

      {!inPrivateLibs && <PublicSearchDisclaimer />}

      <SearchEntities
        useSearchContext={useSearchSongsContext}
        searchMethod={(params) =>
          songsApi!.searchSongs({
            request: {
              ...params.request,
              artist_id: artistId || undefined,
              library_type: inPrivateLibs ? "private" : undefined,
              by_lyrics: byLyrics,
            },
          })
        }
        ListItemComponent={SearchSongListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Song by Title or Lyrics"
        entityName="songs"
      />
    </>
  );
}

export default SearchSongs;
