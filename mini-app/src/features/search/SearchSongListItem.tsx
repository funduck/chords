import { Anchor, Flex, Text } from "@mantine/core";

import { SongInfoEntity } from "@src/hooks/Api";
import { stringToTitleCase } from "@src/utils/string";

import { useSongContext } from "../song/SongContext";

function SearchSongListItem({ entity }: { entity: SongInfoEntity }) {
  const { loadSong } = useSongContext();

  let title = stringToTitleCase(entity.title);
  const artistOrComposer = (entity.artists || entity.composers || []).map((a) => a.name).join(", ");

  return (
    <Anchor
      c="primary"
      onClick={() => {
        loadSong(entity.id!);
        // navigate(RoutesEnum.Songs(song.id));
        // Signals.publishSongId.set(song.id!);
      }}
    >
      <Flex direction={"row"} align={"center"} gap={"sm"}>
        <Text size="lg">{title}</Text>
        {artistOrComposer && <Text c="dimmed">{artistOrComposer}</Text>}
        <Text c="dimmed" size="xs">
          #{entity.id}
        </Text>
      </Flex>
    </Anchor>
  );
}

export default SearchSongListItem;
