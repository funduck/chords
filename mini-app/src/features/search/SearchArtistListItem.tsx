import ButtonCell from "@src/components/ButtonCell";
import { ArtistInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

function SearchArtistListItem({ entity }: { entity: ArtistInfoEntity }) {
  return (
    <ButtonCell
      onClick={() => {
        // navigate(RoutesEnum.Song(song.id));
        Signals.publishArtistId.set(entity.id!);
      }}
    >
      {entity.name}
    </ButtonCell>
  );
}

export default SearchArtistListItem;
