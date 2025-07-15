import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { RoomEntity, useRoomsApi } from "@src/hooks/Api";
import { useWebSocket } from "@src/hooks/WebSocket";

import { useSongContext } from "../song/SongContext";
import { SongSettingsDto } from "../song/settings";

export type RoomStateDto = {
  song_id: number | null;
  song_settings: SongSettingsDto;
};

interface RoomState {
  room?: RoomEntity | null;
  syncEnabled?: boolean;
}

type EventNamesEnum = "song_id" | "song_scroll" | "song_settings";

type PublishState = Partial<Record<EventNamesEnum, { at: number; value: any }>>; // Map of event names to timestamps

interface RoomContextType {
  // STATE
  roomState: RoomState;

  publishState: PublishState;
  applyState: PublishState;

  // BASIC UPDATE
  updateRoomState: (updates: Partial<RoomState>) => void;

  // ACTIONS
  createRoom: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;

  // EVENTS
  publish(eventName: EventNamesEnum, value: any): void;
  apply(eventName: EventNamesEnum, value: any): void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomContextProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState>({});
  const [publishState, setPublishState] = useState<PublishState>({});
  const [applyState, setApplyState] = useState<PublishState>({});

  const roomsApi = useRoomsApi();
  const ws = useWebSocket();

  const navigate = useNavigate();

  const updateRoomState = (updates: Partial<RoomState>) => {
    setRoomState((prev) => ({ ...prev, ...updates }));
  };

  const handleRoomState = (state: RoomStateDto) => {
    if (!state) {
      console.error("Invalid room state:", state);
      return;
    }
    if (state.song_settings) {
      console.log("Applying room state:", state);
      // Signals.applySongSettings.set(new SongSettingsDto().fromJson(state.song_settings));
    }
    if (state.song_id) {
      console.log("Navigating to song:", state.song_id);
      navigate(RoutesEnum.Songs(state.song_id));
    }
  };

  const handle = (room?: RoomEntity) => {
    if (room) {
      console.log("Joined room:", room);

      setRoomState({ room });

      localStorage.setItem("roomCode", room.code!);

      handleRoomState(room.state as RoomStateDto);
    } else {
      console.log("Left room");

      setRoomState({ room: null });

      localStorage.removeItem("roomCode");
    }
  };

  const createRoom = () => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }
    roomsApi
      .createRoom()
      .then((r) => handle(r))
      .catch(console.error);
  };

  const joinRoom = (roomCode: string) => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }
    roomsApi
      .joinRoom({ request: { room_code: roomCode } })
      .then((r) => handle(r))
      .catch(console.error);
  };

  const leaveRoom = () => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }
    if (!roomState?.room) {
      console.warn("No room to leave");
      return;
    }
    roomsApi
      .leaveRoom({ id: roomState.room.id })
      .then(() => {
        handle();
      })
      .catch(console.error);
  };

  const publish = (eventName: EventNamesEnum, value: any) => {
    setPublishState({
      ...publishState,
      [eventName]: { at: +new Date(), value },
    });
  };

  const apply = (eventName: EventNamesEnum, value: any) => {
    setApplyState({
      ...applyState,
      [eventName]: { at: +new Date(), value },
    });
  };

  // Automatically join the room if roomCode is set and the API is available
  useEffect(() => {
    if (!roomsApi || !ws) {
      return;
    }

    const storedRoomCode = localStorage.getItem("roomCode");
    if (storedRoomCode) {
      console.log("Found stored room code:", storedRoomCode);
      joinRoom(storedRoomCode);
    }
  }, [roomsApi, ws]);

  return (
    <RoomContext.Provider
      value={{
        roomState,
        publishState,
        applyState,

        updateRoomState,

        createRoom,
        joinRoom,
        leaveRoom,

        publish,
        apply,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomContext must be used within a RoomContextProvider");
  }
  return context;
}
