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
        navigate(RoutesEnum.SearchArtists(entity.id));
      }}
      href={RoutesEnum.SearchArtists(entity.id)}
    >
      <Flex direction={"row"} align={"center"} gap={"sm"}>
        <Text size="lg">{entity.name}</Text>
        <Text c="dimmed" size="xs">
          #{entity.id}
        </Text>
      </Flex>
    </Anchor>
  );
}

export default SearchArtistListItem;
