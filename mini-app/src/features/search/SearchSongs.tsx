import { Space } from "@mantine/core";
import { useContext, useEffect } from "react";

import { SongsApiContext } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchResetArtist from "./SearchResetArtist";
import SearchSongListItem from "./SearchSongListItem";

function SearchSongs() {
  const songsApi = useContext(SongsApiContext);

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

  return (
    <>
      <SearchResetArtist />
      <Space h="md" />
      <SearchEntities
        apiContext={SongsApiContext}
        useSearchContext={useSearchSongsContext}
        searchMethod={(params) => songsApi!.searchSongs(params)}
        ListItemComponent={SearchSongListItem}
        listItemProps={(entity) => ({ song: entity })}
        placeholder="Search Song by Title or Lyrics"
        entityName="songs"
      />
    </>
  );
}

export default SearchSongs;
