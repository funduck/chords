import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import ButtonCell from "@src/components/ButtonCell";
import { ArtistInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

function SearchArtistListItem({ entity }: { entity: ArtistInfoEntity }) {
  const navigate = useNavigate();
  return (
    <ButtonCell
      onClick={() => {
        Signals.artist.set(entity!);
        navigate(RoutesEnum.Search({ artistId: entity.id }));
      }}
    >
      {entity.name}
    </ButtonCell>
  );
}

export default SearchArtistListItem;
