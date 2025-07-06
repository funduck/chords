import { useContext } from "react";

import { ArtistsApiContext } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import SearchArtistListItem from "./SearchArtistListItem";
import { useSearchArtistsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";

function SearchArtists() {
  const artistsApi = useContext(ArtistsApiContext);

  // Initialize scroll position management
  useScrollPosition();

  return (
    <SearchEntities
      apiContext={ArtistsApiContext}
      useSearchContext={useSearchArtistsContext}
      searchMethod={(params) => artistsApi!.searchArtists(params)}
      ListItemComponent={SearchArtistListItem}
      listItemProps={(entity) => ({ entity })}
      placeholder="Search by Name"
      entityName="artists"
    />
  );
}

export default SearchArtists;
