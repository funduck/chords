import { Text } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { useParams } from "react-router";

import { useArtistsApi, useSongsApi } from "@src/hooks/Api";
import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";

import SearchArtists from "../search/SearchArtists";
import { useSearchSongsContext } from "../search/SearchContext";
import SearchSongs from "../search/SearchSongs";

function Artist() {
  // Initialize scroll position management
  useScrollPosition();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent("Artist");
  }, []);

  const { artistId } = useParams<{ artistId: string }>();
  const songsApi = useSongsApi();
  const artistsApi = useArtistsApi();
  const artist = useSignal(Signals.artist);
  const { updateSearchState } = useSearchSongsContext();

  useEffect(() => {
    if (artistId && artistsApi) {
      if (artist?.id != parseInt(artistId)) {
        // Fetch artist info if not already loaded
        artistsApi
          .getArtistByID({ id: parseInt(artistId) })
          .then((response) => {
            Signals.artist.set(response);
          })
          .catch(console.error);
      } else {
        // Reset search state if artistId matches the current artist
        updateSearchState({
          cursorAfter: undefined,
          cursorBefore: undefined,
          loadingMore: false,
          searching: true,
          query: "",
        });
      }
    }
    if (!artistId && artist) {
      // Reset artist if artistId is not provided
      Signals.artist.set(null);
      // Reset search state
      updateSearchState({
        cursorAfter: undefined,
        cursorBefore: undefined,
        loadingMore: false,
        searching: true,
        query: "",
      });
    }
  }, [artistId, artist, artistsApi]);

  if (!songsApi || !artistsApi) {
    return <Text>Waititng for api...</Text>;
  }

  if (!artistId || !artist) {
    return <SearchArtists />;
  }

  return <SearchSongs artistId={artist.id} />;
}

export default Artist;
