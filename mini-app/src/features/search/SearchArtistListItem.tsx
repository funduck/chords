import { Anchor, Text } from "@mantine/core";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { ArtistInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

function SearchArtistListItem({ entity }: { entity: ArtistInfoEntity }) {
  const navigate = useNavigate();
  return (
    <Anchor
      c="primary"
      onClick={() => {
        Signals.artist.set(entity!);
        navigate(RoutesEnum.Artist(entity.id));
      }}
    >
      <Text size="lg">{entity.name}</Text>
    </Anchor>
  );
}

export default SearchArtistListItem;
