import { Button, Text, Input, Section, Title } from "@telegram-apps/telegram-ui";
import { useContext, useEffect, useState } from "react";
import { RoomsApiContext } from "../connection/api-connection";
import { useSignal } from "@telegram-apps/sdk-react";
import { Signals } from "@src/signals-registry";
import { ChordsComApiInternalEntityRoom } from "@src/generated/api";
import { SongSettings } from "../song/settings";
import { useNavigate } from "react-router";
import { RoutesEnum } from "@src/routes";

export type RoomState = {
  song_id: string | null;
  song_settings: SongSettings;
};

function Room() {
  const roomsApi = useContext(RoomsApiContext);
  const room = useSignal(Signals.room);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleRoomState(state: RoomState) {
    if (!state) {
      console.error("Invalid room state:", state);
      return;
    }
    if (state.song_settings) {
      console.log("Applying room state:", state);
      Signals.applySongSettings.set(new SongSettings().fromJson(state.song_settings));
    }
    if (state.song_id) {
      console.log("Navigating to song:", state.song_id);
      navigate(RoutesEnum.Song(state.song_id));
    }
  }

  function handleRoom(room?: ChordsComApiInternalEntityRoom) {
    if (room) {
      Signals.room.set(room);
      // Store the room code in local storage
      localStorage.setItem("roomCode", room.code!);
      console.log("Joined room:", room);
      // Apply room state
      handleRoomState(room.state as RoomState);
    } else {
      Signals.room.set(null);
      // Clear the room code from local storage
      localStorage.removeItem("roomCode");
      console.log("Left room");
    }
  }
  function createRoom() {
    if (!roomsApi) {
      console.error("Rooms API is not available");
      return;
    }
    roomsApi.apiRoomsPost().then(handleRoom).catch(console.error);
  }
  function joinRoom(forceRoomCode?: string) {
    if (!roomsApi) {
      console.error("Rooms API is not available");
      return;
    }
    roomsApi
      .apiRoomsJoinPost({
        request: { room_code: roomCode || forceRoomCode },
      })
      .then(handleRoom)
      .catch(console.error);
  }
  function leaveRoom() {
    if (!roomsApi) {
      console.error("Rooms API is not available");
      return;
    }
    roomsApi
      .apiRoomsIdLeavePost({
        id: room!.id!,
      })
      .then(() => {
        handleRoom();
      })
      .catch(console.error);
  }

  // Automatically join the room if roomCode is set and the API is available
  useEffect(() => {
    if (room) {
      return; // Already in a room
    }
    const storedRoomCode = localStorage.getItem("roomCode");
    if (storedRoomCode) {
      console.log("Found stored room code:", storedRoomCode);
      joinRoom(storedRoomCode);
    }
  }, [roomsApi]);

  if (!room) {
    return (
      <Section>
        <Title>Room</Title>

        <Button onClick={createRoom}>Create Room</Button>

        <Input
          header="Room code"
          name="roomCode"
          onChange={(event) => setRoomCode(event.target.value)}
          after={
            <Button onClick={() => joinRoom()} disabled={roomCode == ""}>
              Join Room
            </Button>
          }
        />
      </Section>
    );
  }
  return (
    <Section>
      <Title>Room</Title>

      <Text>Code: {room.code}</Text>
      <br />
      <Button onClick={leaveRoom}>Leave Room</Button>
    </Section>
  );
}

export default Room;
