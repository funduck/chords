import { useContext } from "react";

import { SongsApiContext } from "@src/hooks/Api";

import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchSongListItem from "./SearchSongListItem";

function SearchSongs() {
  const songsApi = useContext(SongsApiContext);

  return (
    <SearchEntities
      apiContext={SongsApiContext}
      useSearchContext={useSearchSongsContext}
      searchMethod={(params) => songsApi!.searchSongs(params)}
      ListItemComponent={SearchSongListItem}
      listItemProps={(entity) => ({ song: entity })}
      placeholder="Search by Title, Artist or Lyrics"
      entityName="songs"
    />
  );
}

export default SearchSongs;
