import { Button } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext } from "react";

import { SongsApiContext } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchSongListItem from "./SearchSongListItem";

function SearchSongs() {
  const songsApi = useContext(SongsApiContext);

  const artist = useSignal(Signals.artist);

  return (
    <>
      {artist?.name && (
        <Button
          variant="outline"
          m="md"
          onClick={() => {
            Signals.artist.set(null);
          }}
        >
          Cancel search in: {artist.name}
        </Button>
      )}

      <SearchEntities
        apiContext={SongsApiContext}
        useSearchContext={useSearchSongsContext}
        searchMethod={(params) =>
          songsApi!.searchSongs({
            request: {
              ...params.request,
              artist_id: artist?.id,
            },
          })
        }
        ListItemComponent={SearchSongListItem}
        listItemProps={(entity) => ({ song: entity })}
        placeholder="Search by Title or Lyrics"
        entityName="songs"
      />
    </>
  );
}

export default SearchSongs;
