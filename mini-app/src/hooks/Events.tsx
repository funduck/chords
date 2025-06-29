import { useSignal } from "@telegram-apps/sdk-react";
import { cloneDeep, isEqual } from "lodash";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { RoomsApiContext } from "@src/hooks/Api";
import { WebSocketContext } from "@src/hooks/WebSocket";
import { Signals } from "@src/services/signals-registry";

import { SongSettings } from "@features/song/settings";

import { RoomState } from "./RoomService";

class Event {
  // These fields are accepted by the server
  origin: number;
  context: string;
  type: string;
  data: any;

  constructor(obj: { origin: number; context: string; type: string; data: any }) {
    this.origin = obj.origin;
    this.context = obj.context;
    this.type = obj.type;
    this.data = obj.data;
  }

  toJson(): string {
    return JSON.stringify({
      origin: this.origin,
      context: this.context,
      type: this.type,
      data: this.data,
    });
  }

  static fromJson(obj: string): Event {
    const parsed = JSON.parse(obj);
    if (!parsed.origin || !parsed.context || !parsed.type || !parsed.data) {
      throw new Error("Invalid event format");
    }
    return new Event(parsed);
  }
}

class RoomEvent {
  private event: Event;

  constructor(obj: Event | { userId: number; roomId: number; type: string; data: any }) {
    if (obj instanceof Event) {
      this.event = obj;
      return;
    }
    this.event = new Event({
      origin: obj.userId,
      context: `room:${obj.roomId}`,
      type: obj.type,
      data: obj.data,
    });
  }

  static fromJson(obj: string): RoomEvent {
    return new RoomEvent(Event.fromJson(obj));
  }

  toJson(): string {
    return this.event.toJson();
  }

  get userId(): number {
    return this.event.origin;
  }

  get roomId(): number | null {
    const re = this.event.context.match(/^room:(\d+)$/);
    if (!re) {
      return null;
    }
    return parseInt(re[1], 10);
  }

  get type(): string {
    return this.event.type;
  }

  get data(): any {
    return this.event.data;
  }
}

export function EventsPublisher() {
  const ws = useContext(WebSocketContext);
  const userId = useSignal(Signals.userId);
  const room = useSignal(Signals.room);
  const roomsApi = useContext(RoomsApiContext);

  const publishSongSettings = useSignal(Signals.publishSongSettings);
  const publishSongScroll = useSignal(Signals.publishSongScroll);
  const publishSongId = useSignal(Signals.publishSongId);
  useEffect(() => {
    if (!ws || !userId || !room) {
      return;
    }
    let event: RoomEvent | null = null;
    if (publishSongSettings !== null) {
      event = new RoomEvent({
        userId: userId,
        roomId: room.id!,
        type: "song_settings",
        data: {
          songSettings: publishSongSettings,
        },
      });
      Signals.publishSongSettings.set(null); // Clear the signal after publishing
    }
    if (publishSongScroll !== null) {
      event = new RoomEvent({
        userId: userId,
        roomId: room.id!,
        type: "song_scroll",
        data: {
          scrollPercent: publishSongScroll,
        },
      });
      Signals.publishSongScroll.set(null); // Clear the signal after publishing
    }
    if (publishSongId !== null) {
      event = new RoomEvent({
        userId: userId,
        roomId: room.id!,
        type: "song_id",
        data: {
          songId: publishSongId,
        },
      });
      Signals.publishSongId.set(null); // Clear the signal after publishing
    }
    if (event) {
      ws.send(event.toJson());
      console.debug("Published:", event);

      // Clone the room state to avoid mutating the original object
      const roomState = cloneDeep((room.state as RoomState) || {});

      roomState.song_settings = publishSongSettings || roomState.song_settings;
      roomState.song_id = publishSongId || roomState.song_id;

      if (!isEqual(roomState, room.state)) {
        console.debug("Updating room state:", roomState);
        roomsApi
          ?.updateRoom({
            id: room.id!,
            request: {
              state: roomState,
            },
          })
          .catch((error) => {
            console.error("Failed to update room state:", error);
          });
      }
    }
  }, [ws, userId, room, publishSongSettings, publishSongScroll, publishSongId]);

  return <></>;
}

export function EventsConsumer() {
  const ws = useContext(WebSocketContext);
  const userId = useSignal(Signals.userId);
  const room = useSignal(Signals.room);
  const navigate = useNavigate();

  useEffect(() => {
    // Handling messages only if we are in room and have a userId
    if (!ws || !userId || !room) {
      return;
    }
    ws.onmessage = (event) => {
      if (!event || !event.data) {
        console.warn("Received empty event data");
        return;
      }
      const dto = RoomEvent.fromJson(event.data);
      if (dto.userId == userId) {
        console.warn("Ignoring message from self:", dto);
        return;
      }
      if (dto.roomId != room.id) {
        console.warn("Received event for a different room:", dto);
        return;
      }
      console.debug("Received event:", dto);
      switch (dto.type) {
        case "song_settings": {
          Signals.applySongSettings.set(new SongSettings().fromJson(dto.data.songSettings));
          break;
        }
        case "song_scroll": {
          Signals.applySongScroll.set(dto.data.scrollPercent);
          break;
        }
        case "song_id": {
          navigate(RoutesEnum.Song(dto.data.songId));
          break;
        }
        default:
          console.warn("Unknown event type:", dto);
      }
    };
    return () => {
      ws.onmessage = null; // Clear the message handler when the component unmounts
    };
  }, [ws, userId, room]); // We change handler when any of these dependencies change

  return <></>;
}
