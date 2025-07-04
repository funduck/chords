import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongInfoEntity } from "@src/hooks/Api";
import { Signals } from "@src/services/signals-registry";

import ButtonCell from "@components/ButtonCell";
import Stack from "@components/Stack";

function SearchSongListItem({ song }: { song: SongInfoEntity }) {
  const navigate = useNavigate();

  let title = song.title;
  const artistOrComposer = song.artist || song.composer;
  if (artistOrComposer && song.title.includes(artistOrComposer)) {
    title = song.title.replace(artistOrComposer, "").trim();
  }

  return (
    <Stack>
      <ButtonCell
        onClick={() => {
          navigate(RoutesEnum.Song(song.id));
          Signals.publishSongId.set(song.id!);
        }}
      >
        {title} {artistOrComposer ? ` - ${artistOrComposer}` : ""}
      </ButtonCell>
    </Stack>
  );
}

export default SearchSongListItem;
