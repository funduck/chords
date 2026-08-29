import { Alert, Box, Button, Group } from "@mantine/core";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";

import { usePlaylistContext } from "./PlaylistContext";
import { usePlaylistEditMode } from "./playlistEditMode";

// Shown on every route that carries playlist edit mode, so the flow stays visible
// while browsing songs or artists.
function PlaylistEditBanner() {
  const navigate = useNavigate();
  const { editing, mode, playlistParam } = usePlaylistEditMode();
  const { playlists, loadPlaylists } = usePlaylistContext();

  // On a cold load of an artist route no SearchSongs is mounted to fetch these,
  // so the banner would have no name to show.
  useEffect(() => {
    if (editing && playlists === null) {
      loadPlaylists();
    }
  }, [editing, playlists, loadPlaylists]);

  if (!editing) {
    return null;
  }

  const name = (playlists || []).find((p) => String(p.id) === playlistParam)?.name || "playlist";

  return (
    // AppShell.Main is a height-constrained flex column, so without flexShrink:0
    // tall page content squashes the banner instead of overflowing past it.
    <Alert color="blue" mb="md" style={{ flexShrink: 0 }}>
      <Group justify="space-between" wrap="nowrap">
        <Box>
          {mode === "add" ? "Adding songs to" : "Removing songs from"} <b>{name}</b>
        </Box>
        <Button variant="outline" size="xs" onClick={() => navigate(RoutesEnum.Playlists)}>
          Done
        </Button>
      </Group>
    </Alert>
  );
}

export default PlaylistEditBanner;
