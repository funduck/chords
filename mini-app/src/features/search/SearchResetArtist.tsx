import { Button, Flex, Space, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useSignal } from "@telegram-apps/sdk-react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { Signals } from "@src/services/signals-registry";

function SearchResetArtist({}: {}) {
  const artist = useSignal(Signals.artist);
  const navigate = useNavigate();
  return (
    <>
      {artist && (
        <Flex direction="row" ta={"center"} align="center" gap="xs" m={"xs"}>
          <Text>Selected artist:</Text>
          <Button
            color={"primary"}
            variant="outline"
            onClick={() => {
              navigate(RoutesEnum.SearchArtists());
            }}
          >
            <Text>{artist?.name}</Text>
            <Space w="xs" />
            <IconX />
          </Button>
        </Flex>
      )}
    </>
  );
}

export default SearchResetArtist;
