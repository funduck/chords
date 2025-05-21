import { RoutesEnum } from "@src/routes";
import { SongDescrDto } from "@src/services/song.service";
import { ButtonCell, Section } from "@telegram-apps/telegram-ui";
import { useNavigate } from "react-router";

function SearchSongListItem({ song }: { song: SongDescrDto }) {
  const navigate = useNavigate();
  return (
    <Section>
      <ButtonCell
        onClick={() => {
          navigate(RoutesEnum.Song(song.id));
        }}
      >
        {song.artist} {song.title}
      </ButtonCell>
    </Section>
  );
}

export default SearchSongListItem;
