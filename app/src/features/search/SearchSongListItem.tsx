import { ActionIcon, Anchor, Flex, Text, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

import { RoutesEnum } from "@src/Router";
import SongCreators from "@src/components/SongCreators";
import { SongInfoEntity } from "@src/hooks/Api";
import { stringToTitleCase } from "@src/utils/string";

import { useSongContext } from "../song/SongContext";

interface SearchSongListItemProps {
  entity: SongInfoEntity;
  // Set only while editing a playlist; plain search renders no button.
  playlistAction?: "add" | "remove";
  onPlaylistAction?: (songId: number) => void;
}

function SearchSongListItem({ entity, playlistAction, onPlaylistAction }: SearchSongListItemProps) {
  const { loadSong } = useSongContext();

  const title = stringToTitleCase(entity.title);

  return (
    <Flex direction={"row"} align={"center"} gap={"sm"}>
      {playlistAction && (
        <Tooltip label={playlistAction === "add" ? "Add to playlist" : "Remove from playlist"} withArrow>
          <ActionIcon
            variant="subtle"
            color={playlistAction === "add" ? "blue" : "red"}
            onClick={() => onPlaylistAction?.(entity.id!)}
          >
            {playlistAction === "add" ? <IconPlus size={16} /> : <IconMinus size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
      <Anchor
        c="primary"
        onClick={(e) => {
          e.preventDefault();
          loadSong(entity.id!);
        }}
        href={RoutesEnum.Songs(entity.id)}
      >
        <Text size="lg">{title}</Text>
      </Anchor>
      <SongCreators song={entity} />
    </Flex>
  );
}

export default SearchSongListItem;
