import { useMemo } from "react";

import { PlaylistEntity } from "@src/hooks/Api";

export interface PlaylistOption {
  value: string;
  label: string;
}

// Build the playlist dropdown options. The empty entry means "no playlist filter".
export function usePlaylistOptions(playlists: PlaylistEntity[] | null): PlaylistOption[] {
  return useMemo(
    () => [
      { value: "", label: "-" },
      ...(playlists || []).map((p) => ({ value: String(p.id), label: p.name })),
    ],
    [playlists],
  );
}
