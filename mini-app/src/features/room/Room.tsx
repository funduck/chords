import { Button, CopyButton, Fieldset, Flex, Space, Stack, Text, TextInput } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useEffect, useState } from "react";

import { Config } from "@src/config";
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
          <Fieldset legend="Create Room" style={{ borderColor: "rgba(0,0,0,0)" }}>
            <Button variant="outline" fullWidth onClick={() => roomService.createRoom()}>
              Create
            </Button>
          </Fieldset>

          <Fieldset legend="Join Room" style={{ borderColor: "rgba(0,0,0,0)" }}>
            <Flex direction={"row"} gap="md">
              <TextInput
                name="roomCode"
                onChange={(event) => setRoomCode(event.target.value)}
                error={
                  roomCode?.length && roomCode.length != 6
                    ? `Need ${6 - (roomCode?.length || 0)} more characters`
                    : undefined
                }
              />
              <Button
                variant="outline"
                onClick={() => roomService.joinRoom(roomCode!)}
                disabled={(roomCode?.length || 0) != 6}
              >
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
            <Button variant="outline" disabled={room?.code == null} onClick={copy}>
              {copied ? "Copied code" : `Copy code "${room?.code}"`}
            </Button>
          )}
        </CopyButton>
        <Button variant="outline" onClick={() => roomService.leaveRoom(room)}>
          Leave Room
        </Button>
      </Stack>
      <Space h="md" />
      {Config.IsDev && room.id && <Text>Room ID: {room.id}</Text>}
      {Config.IsDev && room.users && <Text>Users: {room.users?.map((u) => u.id).join(", ")}</Text>}
      {Config.IsDev && room.state && <Text>State: {JSON.stringify(room.state)}</Text>}
    </>
  );
}

export default Room;
