import { Anchor, Flex, Text } from "@mantine/core";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { ArtistInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

function SearchArtistListItem({ entity }: { entity: ArtistInfoEntity }) {
  const navigate = useNavigate();
  return (
    <Anchor
      c="primary"
      onClick={(e) => {
        e.preventDefault();
        Signals.artist.set(entity!);
        navigate(RoutesEnum.Artists(entity.id));
      }}
      href={RoutesEnum.Artists(entity.id)}
    >
      <Flex direction={"row"} align={"center"} gap={"sm"} pl="md">
        <Text c="dimmed" size="xs" w={40}>
          #{entity.id}
        </Text>
        <Text size="lg">{entity.name}</Text>
        {(entity.song_count ?? 0) > 0 && (
          <Text c="dimmed" size="sm">
            ({entity.song_count} songs)
          </Text>
        )}
        {(entity.composition_count ?? 0) > 0 && (
          <Text c="dimmed" size="sm">
            ({entity.composition_count} compositions)
          </Text>
        )}
      </Flex>
    </Anchor>
  );
}

export default SearchArtistListItem;
