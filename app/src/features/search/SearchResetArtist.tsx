import { Button, Flex, Space, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { useEditModeLink } from "@src/features/playlist/playlistEditMode";
import { Signals } from "@src/services/signals-registry";

function SearchResetArtist({}: {}) {
  const artist = useSignal(Signals.artist);
  const navigate = useNavigate();
  const editLink = useEditModeLink();
  return (
    <>
      {artist && (
        <>
          <Flex direction="row" ta={"center"} align="center" gap="sm" mt="xs" mb="xl">
            <Text fw={500} fz={"1.2em"}>
              Selected artist:
            </Text>
            <Button
              color={"primary"}
              variant="outline"
              onClick={() => {
                navigate(editLink(RoutesEnum.Artists()));
              }}
            >
              <Text>{artist?.name}</Text>
              <Space w="xs" />
              <IconX />
            </Button>
          </Flex>
        </>
      )}
    </>
  );
}

export default SearchResetArtist;
