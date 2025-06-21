import { CopyButton } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useState } from "react";

import Button from "@src/components/Button";
import Input from "@src/components/Input";
import Stack from "@src/components/Stack";
import { RoomServiceContext } from "@src/hooks/room-service";
import { Signals } from "@src/services/signals-registry";

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

  Signals.pageTitle.set("Room");

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
