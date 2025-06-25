import { CopyButton } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useState } from "react";

import { RoomServiceContext } from "@src/hooks/RoomService";
import { Signals } from "@src/services/signals-registry";

import Button from "@components/Button";
import Input from "@components/Input";
import Stack from "@components/Stack";
import Text from "@components/Text";
import Section from "@components/section";

function Room() {
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
        <Section header="New Room">
          <Button onClick={() => roomService.createRoom()}>Create</Button>
        </Section>

        <Section header="Join Room">
          <Input
            before={
              <Button onClick={() => roomService.joinRoom(roomCode!)} disabled={(roomCode?.length || 0) != 6}>
                Join
              </Button>
            }
            name="roomCode"
            onChange={(event) => setRoomCode(event.target.value)}
          />
        </Section>
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
