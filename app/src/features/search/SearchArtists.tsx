import { Switch } from "@mantine/core";
import { useState } from "react";

import { useArtistsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import SearchArtistListItem from "./SearchArtistListItem";
import { useSearchArtistsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";

function SearchArtists() {
  const artistsApi = useArtistsApi();

  // Initialize scroll position management
  useScrollPosition();

  const [inPrivateLibs, setInPrivateLibs] = useState(true);

  if (!artistsApi) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Switch
        mb="md"
        label="In my library"
        checked={inPrivateLibs}
        onChange={(e) => {
          setInPrivateLibs(e.currentTarget.checked);
        }}
      />
      <SearchEntities
        useSearchContext={useSearchArtistsContext}
        searchMethod={(params) =>
          artistsApi!.searchArtists({
            request: { ...params.request, library_type: inPrivateLibs ? "private" : undefined },
          })
        }
        ListItemComponent={SearchArtistListItem}
        listItemProps={(entity) => ({ entity })}
        placeholder="Search Artist by Name"
        entityName="artists"
      />
    </>
  );
}

export default SearchArtists;
