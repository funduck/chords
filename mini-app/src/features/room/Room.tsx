import { Button, CopyButton, Fieldset, Flex, Space, Stack, Text, TextInput } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useEffect, useState } from "react";

import { useHeader } from "@src/hooks/Header";
import { RoomServiceContext } from "@src/hooks/RoomService";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";

function Room() {
  // Initialize scroll position management
  useScrollPosition();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent(<Text>Room</Text>);
  }, []);

  const room = useSignal(Signals.room);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const roomService = useContext(RoomServiceContext);

  if (!roomService) {
    return (
      <>
        <Text>Waiting for api...</Text>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Stack>
          <Fieldset legend="Create Room">
            <Button fullWidth onClick={() => roomService.createRoom()}>
              Create
            </Button>
          </Fieldset>

          <Fieldset legend="Join Room">
            <Flex direction={"row"} gap="md">
              <TextInput
                name="roomCode"
                onChange={(event) => setRoomCode(event.target.value)}
                error={(roomCode?.length || 0) != 6 ? `Need ${6 - (roomCode?.length || 0)} more characters` : undefined}
              />
              <Button onClick={() => roomService.joinRoom(roomCode!)} disabled={(roomCode?.length || 0) != 6}>
                Join
              </Button>
            </Flex>
          </Fieldset>
        </Stack>
      </>
    );
  }

  return (
    <>
      <Stack>
        <CopyButton value={room?.code ?? ""}>
          {({ copied, copy }) => (
            <Button disabled={room?.code == null} onClick={copy}>
              {copied ? "Copied code" : `Copy code "${room?.code}"`}
            </Button>
          )}
        </CopyButton>
        <Button onClick={() => roomService.leaveRoom(room)}>Leave Room</Button>
      </Stack>
      <Space h="md" />
      {room.users && <Text>Users: {room.users?.map((u) => u.id).join(", ")}</Text>}
    </>
  );
}

export default Room;
