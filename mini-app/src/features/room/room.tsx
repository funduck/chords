import { useSignal } from "@telegram-apps/sdk-react";
import { useContext, useState } from "react";

import { RoomServiceContext } from "@src/hooks/room-service";
import { Signals } from "@src/signals-registry";

import Button from "@components/button";
import Input from "@components/input";
import Section from "@components/section";
import Snackbar from "@components/snackbar";
import Text from "@components/text";

function Room() {
  const room = useSignal(Signals.room);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const roomService = useContext(RoomServiceContext);

  function copyCode() {
    if (!room) {
      console.error("No room to copy code from");
      return;
    }
    setCodeCopied(true);
    navigator.clipboard
      .writeText(room.code || "")
      .then(() => {
        console.log("Room code copied to clipboard:", room.code);
      })
      .catch((err) => {
        console.error("Failed to copy room code:", err);
      });
  }

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
          <Button stretched={true} size="m" onClick={() => roomService.createRoom()}>
            Create
          </Button>
        </Section>

        <Section header="Join Room">
          <Input
            before={
              <Button onClick={() => roomService.joinRoom(roomCode!)} size="m" disabled={(roomCode?.length || 0) != 6}>
                Join
              </Button>
            }
            name="roomCode"
            status="focused"
            onChange={(event) => setRoomCode(event.target.value)}
          />
        </Section>
      </>
    );
  }

  return (
    <Section header="Room">
      <Button stretched={true} onClick={copyCode}>
        Copy Code {room.code}
      </Button>
      {codeCopied && <Snackbar onClose={() => setCodeCopied(false)}>Code copied</Snackbar>}
      <br />
      <Button stretched={true} onClick={() => roomService.leaveRoom(room)}>
        Leave Room
      </Button>
    </Section>
  );
}

export default Room;
