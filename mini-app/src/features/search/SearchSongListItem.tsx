import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

import ButtonCell from "@components/ButtonCell";

function SearchSongListItem({ song }: { song: SongInfoEntity }) {
  const navigate = useNavigate();

  let title = song.title;
  const artistOrComposer = (song.artists || song.composers || []).map((a) => a.name).join(", ");
  if (artistOrComposer && song.title?.includes(artistOrComposer)) {
    title = song.title.replace(artistOrComposer, "").trim();
  }

  return (
    <ButtonCell
      onClick={() => {
        navigate(RoutesEnum.Song(song.id));
        Signals.publishSongId.set(song.id!);
      }}
    >
      {title} {artistOrComposer ? ` - ${artistOrComposer}` : ""}
    </ButtonCell>
  );
}

export default SearchSongListItem;
