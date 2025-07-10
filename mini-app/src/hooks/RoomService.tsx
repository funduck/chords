import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { SongSettingsDto } from "@src/features/song/settings";
import { RoomsApi } from "@src/generated/api";
import { Signals } from "@src/services/signals-registry";

import { RoomEntity, RoomsApiContext } from "./Api";
import { WebSocketContext } from "./WebSocket";

export type RoomState = {
  song_id: number | null;
  song_settings: SongSettingsDto;
};

class RoomService {
  constructor(
    private navigate: NavigateFunction,
    private roomsApi: RoomsApi,
  ) {}

  handleRoomState(state: RoomState) {
    if (!state) {
      console.error("Invalid room state:", state);
      return;
    }
    if (state.song_settings) {
      console.log("Applying room state:", state);
      Signals.applySongSettings.set(new SongSettingsDto().fromJson(state.song_settings));
    }
    if (state.song_id) {
      console.log("Navigating to song:", state.song_id);
      this.navigate(RoutesEnum.Song(state.song_id));
    }
  }

  handle(room?: RoomEntity) {
    if (room) {
      console.log("Joined room:", room);

      Signals.room.set(room);

      localStorage.setItem("roomCode", room.code!);

      this.handleRoomState(room.state as RoomState);
    } else {
      console.log("Left room");

      Signals.room.set(null);

      localStorage.removeItem("roomCode");
    }
  }

  createRoom() {
    if (!this.roomsApi) {
      throw new Error("Rooms API is not available");
    }
    return this.roomsApi
      .createRoom()
      .then((r) => this.handle(r))
      .catch(console.error);
  }

  joinRoom(roomCode: string) {
    if (!this.roomsApi) {
      throw new Error("Rooms API is not available");
    }
    return this.roomsApi
      .joinRoom({ request: { room_code: roomCode } })
      .then((r) => this.handle(r))
      .catch(console.error);
  }

  leaveRoom(room: RoomEntity) {
    if (!this.roomsApi) {
      throw new Error("Rooms API is not available");
    }
    return this.roomsApi
      .leaveRoom({ id: room.id! })
      .then(() => {
        this.handle();
      })
      .catch(console.error);
  }
}

export const RoomServiceContext = createContext<RoomService | null>(null);

export function RoomServiceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const ws = useContext(WebSocketContext);
  const roomsApi = useContext(RoomsApiContext);
  const accessToken = useSignal(Signals.accessToken);

  const [roomService, setRoomService] = useState<RoomService | null>(null);

  useEffect(() => {
    if (!accessToken || !roomsApi || !ws) {
      return;
    }

    const roomService = new RoomService(navigate, roomsApi);
    setRoomService(roomService);

    // Automatically join the room if roomCode is set and the API is available
    const storedRoomCode = localStorage.getItem("roomCode");
    if (storedRoomCode) {
      console.log("Found stored room code:", storedRoomCode);
      roomService.joinRoom(storedRoomCode).catch((err) => {
        console.error("Failed to join room with stored code:", err);
        // localStorage.removeItem("roomCode"); // Clear invalid code
      });
    }

    return () => {
      console.debug("Cleaning up RoomService");
      setRoomService(null);
    };
  }, [accessToken, roomsApi, ws]);

  return <RoomServiceContext.Provider value={roomService}>{children}</RoomServiceContext.Provider>;
}
