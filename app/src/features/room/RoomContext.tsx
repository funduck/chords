import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { RoomEntity, useRoomsApi } from "@src/hooks/Api";
import { useWebSocket } from "@src/hooks/WebSocket";

import { useSongContext } from "../song/SongContext";
import { SongSettingsDto } from "../song/settings";

export type RoomStateDto = {
  song_id: number | null;
  song_settings: SongSettingsDto;
  song_sheet: string | null;
  new_sheet: string | null;
};

interface RoomState {
  room?: RoomEntity | null;
  syncEnabled?: boolean;
}

export type EventNamesEnum = "song_id" | "song_scroll" | "song_settings" | "song_sheet" | "new_sheet";

type PublishState = Partial<Record<EventNamesEnum, { at: number; value: any }>>; // Map of event names to timestamps

interface RoomContextType {
  // STATE
  roomState: RoomState;

  publishState: PublishState;
  applyState: PublishState;

  // BASIC UPDATE
  updateRoomState: (updates: Partial<RoomState>) => void;

  // ACTIONS
  createRoom: () => Promise<void>;
  joinRoom: (code: string) => Promise<void>;
  leaveRoom: () => Promise<void>;

  // EVENTS
  publish(eventName: EventNamesEnum, value: any): void;
  apply(eventName: EventNamesEnum, value: any): void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomContextProvider({ children }: { children: ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState>({});
  const [publishState, setPublishState] = useState<PublishState>({});
  const [applyState, setApplyState] = useState<PublishState>({});

  const songContext = useSongContext();

  const roomsApi = useRoomsApi();
  const ws = useWebSocket();

  const updateRoomState = (updates: Partial<RoomState>) => {
    setRoomState((prev) => ({ ...prev, ...updates }));
  };

  const handleRoomState = (state: RoomStateDto) => {
    if (!state) {
      console.error("Invalid room state:", state);
      return;
    }

    console.log("Applying room state:", state);

    if (state.song_id) {
      songContext.setSongId(state.song_id);
      songContext.setSongSheet(state.song_sheet || "");
      songContext.setNewSheet(state.new_sheet || "");
    }

    if (state.song_settings) {
      songContext.updateAutoScrollOptions({
        enabled: state.song_settings.auto_scroll,
        interval: state.song_settings.auto_scroll_interval,
        speed: state.song_settings.auto_scroll_speed,
      });
    }
  };

  const handle = (room?: RoomEntity) => {
    setPublishState({});
    setApplyState({});

    if (room) {
      room.state = room.state || {};
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

  const createRoom = async () => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }
    return roomsApi.createRoom().then((r) => handle(r));
  };

  const joinRoom = async (roomCode: string) => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }

    // Remove stored code
    localStorage.removeItem("roomCode");

    return roomsApi.joinRoom({ request: { room_code: roomCode } }).then((r) => handle(r));
  };

  const leaveRoom = async () => {
    if (!roomsApi) {
      throw new Error("Rooms API is not available");
    }
    if (!roomState?.room) {
      console.warn("No room to leave");
      return;
    }
    return roomsApi
      .leaveRoom({ id: roomState.room.id })
      .then(() => {
        handle();
      })
      .then(() => {
        notifications.show({
          title: "Room Left",
          message: "You have successfully left the room",
          color: "green",
          position: "top-right",
        });
      });
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
