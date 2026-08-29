import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export type PlaylistEditMode = "add" | "remove";

const PLAYLIST_PARAM = "playlist";
const MODE_PARAM = "mode";

// Playlist edit mode lives in the URL so it survives navigation and stays
// linkable. This is the one place that knows how it is encoded.
export function usePlaylistEditMode() {
  const [searchParams] = useSearchParams();

  const playlistParam = searchParams.get(PLAYLIST_PARAM) || "";
  const rawMode = searchParams.get(MODE_PARAM);
  const mode: PlaylistEditMode | undefined =
    rawMode === "add" || rawMode === "remove" ? rawMode : undefined;

  // Rebuilt from the two params we own rather than forwarding location.search
  // wholesale, so unrelated params are never propagated.
  const search = useMemo(() => {
    if (!playlistParam) return "";
    const qs = new URLSearchParams({ [PLAYLIST_PARAM]: playlistParam });
    if (mode) qs.set(MODE_PARAM, mode);
    return `?${qs.toString()}`;
  }, [playlistParam, mode]);

  return {
    playlistParam,
    playlistId: Number(playlistParam) || undefined,
    mode,
    editing: mode !== undefined,
    search,
  };
}

// Append the active edit-mode params to a route so navigating stays in the flow.
export function useEditModeLink() {
  const { search } = usePlaylistEditMode();
  return useCallback((path: string) => (search ? path + search : path), [search]);
}
