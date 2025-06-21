import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import ButtonCell from "@src/components/ButtonCell";
import { Signals } from "@src/services/signals-registry";
import { SongDescrDto } from "@src/services/song.service";

import Stack from "@components/Stack";

function SearchSongListItem({ song }: { song: SongDescrDto }) {
  const navigate = useNavigate();
  return (
    <Stack>
      <ButtonCell
        onClick={() => {
          navigate(RoutesEnum.Song(song.id));
          Signals.publishSongId.set(song.id);
        }}
      >
        {song.artist} {song.title}
      </ButtonCell>
    </Stack>
  );
}

export default SearchSongListItem;
