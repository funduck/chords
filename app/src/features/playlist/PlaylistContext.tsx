import { ReactNode, createContext, useCallback, useContext, useState } from "react";

import { PlaylistEntity, usePlaylistsApi, useSongsApi } from "@src/hooks/Api";

interface PlaylistContextType {
  // Playlists of the currently selected owner (own playlists when no owner is
  // set). null until the first load completes.
  playlists: PlaylistEntity[] | null;
  loading: boolean;
  // Song ids of the playlist currently being edited, so the search page can show
  // Add or Remove per row without refetching.
  membership: Set<number>;
  loadPlaylists: (ownerId?: number) => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: number) => Promise<void>;
  loadMembership: (playlistId: number) => Promise<void>;
  addSong: (playlistId: number, songId: number) => Promise<void>;
  removeSong: (playlistId: number, songId: number) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const playlistsApi = usePlaylistsApi();
  const songsApi = useSongsApi();

  const [playlists, setPlaylists] = useState<PlaylistEntity[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState<Set<number>>(new Set());

  const loadPlaylists = useCallback(
    async (ownerId?: number) => {
      if (!playlistsApi) return;
      setLoading(true);
      try {
        setPlaylists(await playlistsApi.listPlaylists({ owner_id: ownerId }));
      } catch (err) {
        // A revoked share leaves a stale owner selected; show no playlists.
        console.error("Failed to load playlists:", err);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    },
    [playlistsApi],
  );

  const createPlaylist = useCallback(
    async (name: string) => {
      if (!playlistsApi) return;
      await playlistsApi.createPlaylist({ request: { name } });
      await loadPlaylists();
    },
    [playlistsApi, loadPlaylists],
  );

  const deletePlaylist = useCallback(
    async (id: number) => {
      if (!playlistsApi) return;
      await playlistsApi.deletePlaylist({ id });
      await loadPlaylists();
    },
    [playlistsApi, loadPlaylists],
  );

  // Fetch every song id in the playlist in one go. Playlists are small enough
  // that this beats asking the server per row.
  const loadMembership = useCallback(
    async (playlistId: number) => {
      if (!songsApi) return;
      const PAGE_SIZE = 100; // the API caps `limit` at 100, so page through
      try {
        const ids = new Set<number>();
        let cursorAfter: string | undefined = undefined;
        for (;;) {
          const res = await songsApi.searchSongs({
            request: {
              query: "",
              limit: PAGE_SIZE,
              cursor_after: cursorAfter,
              library_type: "private",
              playlist_id: playlistId,
              return_rows: true,
              return_total: false,
            },
          });
          const page = res.entities || [];
          page.forEach((s) => ids.add(s.id!));
          if (page.length < PAGE_SIZE) break;
          cursorAfter = page[page.length - 1].cursor;
        }
        setMembership(ids);
      } catch (err) {
        console.error("Failed to load playlist membership:", err);
        setMembership(new Set());
      }
    },
    [songsApi],
  );

  const addSong = useCallback(
    async (playlistId: number, songId: number) => {
      if (!playlistsApi) return;
      await playlistsApi.addSongToPlaylist({ id: playlistId, song_id: songId });
      setMembership((prev) => new Set(prev).add(songId));
    },
    [playlistsApi],
  );

  const removeSong = useCallback(
    async (playlistId: number, songId: number) => {
      if (!playlistsApi) return;
      await playlistsApi.removeSongFromPlaylist({ id: playlistId, song_id: songId });
      setMembership((prev) => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    },
    [playlistsApi],
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        membership,
        loadPlaylists,
        createPlaylist,
        deletePlaylist,
        loadMembership,
        addSong,
        removeSong,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylistContext() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylistContext must be used within PlaylistProvider");
  }
  return context;
}
