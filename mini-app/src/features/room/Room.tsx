import { Button, CopyButton, Fieldset, Flex, Stack, Text, TextInput } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useState } from "react";

import { RoomServiceContext } from "@src/hooks/RoomService";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";

function Room() {
  const room = useSignal(Signals.room);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const roomService = useContext(RoomServiceContext);

  // Initialize scroll position management
  useScrollPosition();

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
    </>
  );
}

export default Room;
