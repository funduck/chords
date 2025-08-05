import { Anchor, Group } from "@mantine/core";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongEntity } from "@src/hooks/Api";

export default function SongCreators({ song }: { song: SongEntity }) {
  const navigate = useNavigate();

  const artistRefs =
    song?.artists?.map((a) => (
      <Anchor
        key={a.id}
        onClick={(e) => {
          e.preventDefault();
          navigate(RoutesEnum.Artists(a.id));
        }}
        href={RoutesEnum.Artists(a.id)}
      >
        {a.name}
      </Anchor>
    )) || [];

  const composerRefs =
    song?.composers?.map((a) => (
      <Anchor
        key={a.id}
        onClick={(e) => {
          e.preventDefault();
          navigate(RoutesEnum.Artists(a.id));
        }}
        href={RoutesEnum.Artists(a.id)}
      >
        {a.name}
      </Anchor>
    )) || [];

  return (
    <Group>
      {artistRefs.length > 0 && artistRefs}
      {composerRefs.length > 0 && composerRefs}
    </Group>
  );
}
