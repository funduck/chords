import { Button, CopyButton, Fieldset, Flex, Space, Stack, Text, TextInput } from "@mantine/core";
import { IconCopy, IconDoorExit, IconShare3 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import { useRoomsApi } from "@src/hooks/Api";
import { useHeader } from "@src/hooks/Header";
import { useScrollPosition } from "@src/hooks/useScrollPosition";

import { useRoomContext } from "./RoomContext";

function Room() {
  // Initialize scroll position management
  useScrollPosition();

  const { roomState, createRoom, joinRoom, leaveRoom } = useRoomContext();
  const room = roomState.room;

  const roomsApi = useRoomsApi();

  const { setCenterContent } = useHeader();
  useEffect(() => {
    setCenterContent(<Text>Room</Text>);
  }, []);

  const [roomCode, setRoomCode] = useState<string | null>(null);

  const currentURL = window.location.href;
  const { roomCode: joinRoomCode } = useParams();

  useEffect(() => {
    if (!roomsApi) {
      return;
    }
    if (joinRoomCode) {
      joinRoom(joinRoomCode);
    }
  }, [roomsApi]);

  if (!room) {
    return (
      <>
        <Stack>
          <Fieldset legend="Create Room" style={{ borderColor: "rgba(0,0,0,0)" }}>
            <Button variant="outline" fullWidth onClick={() => createRoom()}>
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
              <Button variant="outline" onClick={() => joinRoom(roomCode!)} disabled={(roomCode?.length || 0) != 6}>
                Join
              </Button>
            </Flex>
          </Fieldset>
        </Stack>
      </>
    );
  }

  const joinLink = room.code ? `${currentURL.replace(/\/room.+/, "/room")}/join/${room.code}` : "";

  return (
    <>
      <Stack>
        <CopyButton value={joinLink}>
          {({ copied, copy }) => (
            <Button variant="outline" disabled={room?.code == null} onClick={copy}>
              {copied ? (
                "Copied"
              ) : (
                <>
                  <IconShare3 />
                  <Space w="xs" />
                  Copy join link
                </>
              )}
            </Button>
          )}
        </CopyButton>
        <CopyButton value={room?.code ?? ""}>
          {({ copied, copy }) => (
            <Button variant="outline" disabled={room?.code == null} onClick={copy}>
              {copied ? (
                "Copied"
              ) : (
                <>
                  <IconCopy />
                  <Space w="xs" />
                  Copy code {room?.code}
                </>
              )}
            </Button>
          )}
        </CopyButton>
        <Button variant="outline" onClick={() => leaveRoom()}>
          <IconDoorExit />
          <Space w="xs" />
          Leave Room
        </Button>
      </Stack>
      <Space h="md" />
      {/* {Config.IsDev && room.id && <Text>Room ID: {room.id}</Text>}
      {Config.IsDev && room.users && <Text>Users: {room.users?.map((u) => u.id).join(", ")}</Text>}
      {Config.IsDev && room.state && <Text>State: {JSON.stringify(room.state)}</Text>} */}
    </>
  );
}

export default Room;
