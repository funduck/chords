import { useSignal } from "@telegram-apps/sdk-react";
import { cloneDeep, isEqual } from "lodash";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { useRoomsApi } from "@src/hooks/Api";
import { useWebSocket } from "@src/hooks/WebSocket";
import { Signals } from "@src/services/signals-registry";

import { SongSettingsDto } from "@features/song/settings";

import { AutoScrollOptions, useSongContext } from "../song/SongContext";
import { RoomStateDto, useRoomContext } from "./RoomContext";

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

export function RoomEventsPublisher() {
  const ws = useWebSocket();
  const roomsApi = useRoomsApi();

  const userId = useSignal(Signals.userId);

  const { songState } = useSongContext();
  const { roomState, publishState, applyState, publish } = useRoomContext();
  const room = roomState.room;

  const publishedSongId = publishState["song_id"];
  const publishedScroll = publishState["song_scroll"];
  const publishedSettings = publishState["song_settings"];

  const appliedScroll = applyState["song_scroll"];
  const appliedSettings = applyState["song_settings"];

  const now = +Date.now();

  useEffect(() => {
    if (!ws || !userId || !room || roomState.syncEnabled === false) {
      return;
    }
    // Construct published event only if something changed
    let events: RoomEvent[] = [];

    if (songState.songId != null && songState.songId != publishedSongId?.value) {
      events.push(
        new RoomEvent({
          userId: userId,
          roomId: room.id!,
          type: "song_id",
          data: {
            songId: songState.songId,
          },
        }),
      );
      publish("song_id", songState.songId!);
    }
    if (
      songState.scrollPosition !== null &&
      songState.scrollPosition != publishedScroll?.value &&
      (appliedScroll?.at ?? 0) + 1000 < now // Only publish if the last applied scroll was more than 1 second ago
    ) {
      events.push(
        new RoomEvent({
          userId: userId,
          roomId: room.id!,
          type: "song_scroll",
          data: {
            scrollPercent: songState.scrollPosition,
          },
        }),
      );
      publish("song_scroll", songState.scrollPosition!);
    }
    if (
      songState.autoScrollOptions &&
      !isEqual(songState.autoScrollOptions, publishedSettings?.value) &&
      (appliedSettings?.at ?? 0) + 1000 < now // Only publish if the last applied settings was more than 1 second ago
    ) {
      events.push(
        new RoomEvent({
          userId: userId,
          roomId: room.id!,
          type: "song_settings",
          data: {
            songSettings: {
              auto_scroll: songState.autoScrollOptions.enabled,
              auto_scroll_interval: songState.autoScrollOptions.interval,
              auto_scroll_speed: songState.autoScrollOptions.speed,
            },
          },
        }),
      );
      publish("song_settings", cloneDeep(songState.autoScrollOptions));
    }

    if (events.length) {
      for (const event of events) {
        // Sending event to WebSocket server
        ws.send(event.toJson());
        console.debug("Published:", event);
      }

      // Some changes should be stored in RoomEntity in database, so

      // Clone the room state to avoid mutating the original object
      const stateDto = cloneDeep((room.state as RoomStateDto) || {});

      // roomState.song_settings = publishSongSettings || roomState.song_settings;
      stateDto.song_id = publishedSongId?.value || stateDto.song_id;

      if (!isEqual(stateDto, room.state)) {
        console.debug("Updating room state:", stateDto);
        roomsApi
          ?.updateRoom({
            id: room.id!,
            request: {
              state: stateDto,
            },
          })
          .catch((error) => {
            console.error("Failed to update room state:", error);
          });
      }
    }
  }, [
    ws,
    userId,
    room,
    roomState.syncEnabled,
    songState.scrollPosition,
    songState.songId,
    songState.autoScrollOptions,
  ]);

  return <></>;
}

export function RoomEventsConsumer() {
  const ws = useWebSocket();

  const userId = useSignal(Signals.userId);

  const { roomState, apply } = useRoomContext();
  const room = roomState.room;

  const { updateSongState } = useSongContext();

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
          apply("song_settings", dto.data.songSettings);
          const settingsDto = new SongSettingsDto().fromJson(dto.data.songSettings);
          updateSongState({
            autoScrollOptions: {
              enabled: settingsDto.auto_scroll,
              interval: settingsDto.auto_scroll_interval,
              speed: settingsDto.auto_scroll_speed,
            },
          });
          break;
        }
        case "song_scroll": {
          apply("song_scroll", dto.data.scrollPercent);
          updateSongState({
            applyScrollPosition: dto.data.scrollPercent,
          });
          break;
        }
        case "song_id": {
          apply("song_id", dto.data.songId);
          navigate(RoutesEnum.Songs(dto.data.songId));
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
