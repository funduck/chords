import { Anchor, Group } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongEntity } from "@src/hooks/Api";

export default function SongCreators({ song, withIcon }: { song: SongEntity; withIcon?: boolean }) {
  const navigate = useNavigate();

  const artistRefs =
    song?.artists?.map((a) => (
      <Anchor
        c="dimmed"
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
        c="dimmed"
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
    <Group gap="xs" c="dimmed" ml="sm">
      {withIcon && <IconUsers size="24px" />}
      {artistRefs.length > 0 && artistRefs}
      {composerRefs.length > 0 && composerRefs}
    </Group>
  );
}
