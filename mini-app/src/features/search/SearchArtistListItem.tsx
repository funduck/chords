import ButtonCell from "@src/components/ButtonCell";
import { ArtistInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

function SearchArtistListItem({ entity }: { entity: ArtistInfoEntity }) {
  return (
    <ButtonCell
      onClick={() => {
        Signals.artist.set(entity!);
        Signals.searchTab.set("song");
      }}
    >
      {entity.name}
    </ButtonCell>
  );
}

export default SearchArtistListItem;
