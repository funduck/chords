import { Anchor, Flex, Text } from "@mantine/core";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";
import { stringToTitleCase } from "@src/utils/string";

function SearchSongListItem({ song }: { song: SongInfoEntity }) {
  const navigate = useNavigate();

  let title = stringToTitleCase(song.title);
  const artistOrComposer = (song.artists || song.composers || []).map((a) => a.name).join(", ");
  // if (artistOrComposer && song.title?.includes(artistOrComposer)) {
  //   title = song.title.replace(artistOrComposer, "").trim();
  // }

  return (
    <Anchor
      c="primary"
      onClick={() => {
        navigate(RoutesEnum.Songs(song.id));
        Signals.publishSongId.set(song.id!);
      }}
    >
      <Flex direction={"row"} align={"center"} gap={"sm"}>
        <Text size="lg">{title}</Text>
        {artistOrComposer && <Text c="dimmed">{artistOrComposer}</Text>}
        <Text c="dimmed" size="xs">
          #{song.id}
        </Text>
      </Flex>
    </Anchor>
  );
}

export default SearchSongListItem;
