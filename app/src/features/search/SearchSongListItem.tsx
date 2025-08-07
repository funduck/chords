import { Anchor, Flex, Text } from "@mantine/core";

import { RoutesEnum } from "@src/Router";
import SongCreators from "@src/components/SongCreators";
import { SongInfoEntity } from "@src/hooks/Api";
import { stringToTitleCase } from "@src/utils/string";

import { useSongContext } from "../song/SongContext";

function SearchSongListItem({ entity }: { entity: SongInfoEntity }) {
  const { loadSong } = useSongContext();

  let title = stringToTitleCase(entity.title);

  return (
    <Flex direction={"row"} align={"center"} gap={"sm"} pl="md">
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
