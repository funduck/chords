import { Box, Group, Select, Switch } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

import { SearchSongsRequest } from "@generated/api";

import PageTop from "@src/components/PageTop";
import { useAccountContext } from "@src/features/account/AccountContext";
import { usePlaylistContext } from "@src/features/playlist/PlaylistContext";
import { usePlaylistEditMode } from "@src/features/playlist/playlistEditMode";
import { useSongsApi } from "@src/hooks/Api";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import PublicSearchDisclaimer from "./PublicSearchDisclaimer";
import { useSearchSongsContext } from "./SearchContext";
import SearchEntities from "./SearchEntities";
import SearchResetArtist from "./SearchResetArtist";
import SearchSongListItem from "./SearchSongListItem";
import { deriveLibraryFilter, useLibraryOptions } from "./libraryFilter";
import { usePlaylistOptions } from "./playlistFilter";

const LIBRARY_PREF_KEY = "search-songs-preferences-library";
const PLAYLIST_PREF_KEY = "search-songs-preferences-playlist";

function SearchSongs({ artistId }: { artistId?: number }) {
  const songsApi = useSongsApi();
  const { collections } = useAccountContext();
  const {
    playlists,
    membership,
    loadPlaylists,
    loadMembership,
    addSong,
    removeSong,
  } = usePlaylistContext();

  // Initialize scroll position management
  useScrollPosition();

  const { searchState, updateSearchState } = useSearchSongsContext();

  const { playlistParam: paramPlaylistId, mode } = usePlaylistEditMode();

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
  // A ?playlist= param wins over the persisted preference — except in add mode,
  // which deliberately searches the whole library.
  const [playlistSel, setPlaylistSel] = useState<string>(() =>
    mode === "add" ? "" : paramPlaylistId || localStorage.getItem(PLAYLIST_PREF_KEY) || "",
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

  // Add mode searches the whole library, so the playlist filter is off there.
  const publicSelected = effectiveSel === "public";
  const playlistDisabled = mode === "add";
  const playlistOptions = usePlaylistOptions(playlists);
  // Drop a selection that is not among the owner's playlists: it was deleted, or
  // it belongs to a library we just switched away from.
  const playlistKnown =
    playlists === null || playlistSel === "" || playlists.some((p) => String(p.id) === playlistSel);
  const effectivePlaylistSel = playlistDisabled || !playlistKnown ? "" : playlistSel;
  const selectedPlaylistId = Number(effectivePlaylistSel) || undefined;

  // A chosen playlist replaces the library filter rather than narrowing it, so at
  // any moment exactly one of the two dropdowns is doing the filtering. Fade the
  // other one to show it is inert.
  const playlistActive = selectedPlaylistId !== undefined;
  const INACTIVE_OPACITY = 0.5;

  // Reload the playlist dropdown as soon as the library selection changes, and
  // drop the previous choice: a playlist id is meaningless across owners.
  useEffect(() => {
    loadPlaylists(publicSelected ? undefined : ownerId);
  }, [loadPlaylists, ownerId, publicSelected]);

  // Add mode needs to know which songs are already in the playlist so it can
  // offer Remove instead of Add.
  useEffect(() => {
    if (mode === "add" && paramPlaylistId) {
      loadMembership(Number(paramPlaylistId));
    }
  }, [mode, paramPlaylistId, loadMembership]);

  const searchMethod = useCallback(
    (params: SearchSongsRequest) =>
      songsApi!.searchSongs({
        request: {
          ...params.request,
          artist_id: artistId || undefined,
          // A playlist replaces the library filter rather than narrowing it, so
          // it always shows every song it holds.
          library_type: selectedPlaylistId ? undefined : libraryType,
          owner_id: selectedPlaylistId ? undefined : ownerId,
          playlist_id: selectedPlaylistId,
          by_lyrics: byLyrics,
        },
      }),
    [songsApi, artistId, libraryType, ownerId, selectedPlaylistId, byLyrics],
  );

  // SearchEntities only re-runs on `searching`/`loadingMore`, so changing a
  // filter here has to kick off the search itself.
  useEffect(() => {
    updateSearchState({
      entities: null,
      cursorAfter: undefined,
      cursorBefore: undefined,
      searching: true,
    });
  }, [effectiveSel, selectedPlaylistId]);

  const playlistAction = (songId: number): "add" | "remove" | undefined => {
    if (mode === "remove") return "remove";
    if (mode === "add") return membership.has(songId) ? "remove" : "add";
    return undefined;
  };

  const onPlaylistAction = async (songId: number) => {
    if (!paramPlaylistId) return;
    const playlistId = Number(paramPlaylistId);
    if (playlistAction(songId) === "add") {
      await addSong(playlistId, songId);
      return;
    }
    await removeSong(playlistId, songId);
    if (mode === "remove") {
      // The row no longer belongs to the playlist we are showing, so drop it.
      updateSearchState({
        entities: (searchState.entities || []).filter((s) => s.id !== songId),
      });
    }
  };

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
        listItemProps={(entity) => ({
          entity,
          playlistAction: playlistAction(entity.id!),
          onPlaylistAction,
        })}
        placeholder="Search Song by Title or Lyrics"
        entityName="songs"
        afterQueryInput={
          <Box>
            <Group gap="xl" align="flex-end" wrap={"wrap"}>
              <Group align="flex-end" gap="sm">
                <Select
                  label="Library"
                  style={{ opacity: playlistActive ? INACTIVE_OPACITY : 1, transition: "opacity 150ms" }}
                  data={libraryOptions}
                  value={effectiveSel}
                  onChange={(value) => {
                    const newValue = value || "my";
                    setLibrarySel(newValue);
                    localStorage.setItem(LIBRARY_PREF_KEY, newValue);
                    setPlaylistSel("");
                    localStorage.setItem(PLAYLIST_PREF_KEY, "");
                  }}
                  allowDeselect={false}
                  comboboxProps={{ withinPortal: true }}
                  w={220}
                />
                <Select
                  label="Playlist"
                  // Mantine already dims a disabled input; fading on top double-fades it.
                  style={{
                    opacity: playlistDisabled || playlistActive ? 1 : INACTIVE_OPACITY,
                    transition: "opacity 150ms",
                  }}
                  data={playlistOptions}
                  value={effectivePlaylistSel}
                  disabled={playlistDisabled}
                  onChange={(value) => {
                    const newValue = value || "";
                    setPlaylistSel(newValue);
                    localStorage.setItem(PLAYLIST_PREF_KEY, newValue);
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
