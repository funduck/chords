import { Space, Switch } from "@mantine/core";
import { useEffect, useState } from "react";

import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

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

  const [inPrivateLibs, setInPrivateLibs] = useState(true);

  if (!songsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <SearchResetArtist />
      <Space h="md" />
      <Switch
        mb="md"
        label="In my library"
        checked={inPrivateLibs}
        onChange={(e) => {
          setInPrivateLibs(e.currentTarget.checked);
        }}
      />
      <SearchEntities
        useSearchContext={useSearchSongsContext}
        searchMethod={(params) =>
          songsApi!.searchSongs({
            request: {
              ...params.request,
              artist_id: artistId || undefined,
              library_type: inPrivateLibs ? "private" : undefined,
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
