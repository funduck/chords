import { ActionIcon, Anchor, Box, Button, Group, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import PageTop from "@src/components/PageTop";
import { usePlaylistsApi } from "@src/hooks/Api";

import { usePlaylistContext } from "./PlaylistContext";

function Playlists() {
  const playlistsApi = usePlaylistsApi();
  const navigate = useNavigate();
  const { playlists, loadPlaylists, createPlaylist, deletePlaylist } = usePlaylistContext();

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  if (!playlistsApi) {
    return <div>Loading...</div>;
  }

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createPlaylist(name);
      setName("");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number, playlistName: string) => {
    if (!window.confirm(`Delete playlist "${playlistName}"? The songs themselves are not deleted.`)) {
      return;
    }
    await deletePlaylist(id);
  };

  return (
    <Box mt="xl">
      <PageTop
        title="Playlists"
        ml={0}
        description="Group songs for a gig. Pick a playlist in the songs search to see only its songs."
      />

      <Stack gap="xs">
        {(playlists || []).map((playlist) => (
          <Group key={playlist.id} gap="xs" wrap="nowrap">
            <Anchor
              c="primary"
              onClick={(e) => {
                e.preventDefault();
                navigate(`${RoutesEnum.Songs()}?playlist=${playlist.id}`);
              }}
              href={`${RoutesEnum.Songs()}?playlist=${playlist.id}`}
              style={{ flex: 1 }}
            >
              <Text size="lg">{playlist.name}</Text>
            </Anchor>
            <Text size="sm" c="dimmed">
              {playlist.song_count || 0} songs
            </Text>
            <Tooltip label="Add songs" withArrow>
              <ActionIcon variant="subtle" onClick={() => navigate(RoutesEnum.PlaylistAdd(playlist.id))}>
                <IconPlus size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Remove songs" withArrow>
              <ActionIcon variant="subtle" onClick={() => navigate(RoutesEnum.PlaylistRemove(playlist.id))}>
                <IconMinus size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete playlist" withArrow>
              <ActionIcon variant="subtle" color="red" onClick={() => remove(playlist.id, playlist.name)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}

        {playlists?.length === 0 && (
          <Text size="sm" c="dimmed">
            You have no playlists yet.
          </Text>
        )}

        <Group gap="xs" wrap="nowrap" mt="md">
          <TextInput
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            style={{ flex: 1 }}
          />
          <Button
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={create}
            loading={busy}
            disabled={!name.trim()}
          >
            Create playlist
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default Playlists;
