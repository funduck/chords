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
        <Text size="lg">{entity.name}</Text>
        <Text c="dimmed" size="xs">
          #{entity.id}
        </Text>
      </Flex>
    </Anchor>
  );
}

export default SearchArtistListItem;
