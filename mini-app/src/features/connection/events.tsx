import { useContext, useEffect } from "react";
import { WebSocketContext } from "./ws-connection";
import { useSignal } from "@telegram-apps/sdk-react";
import { Signals } from "@src/signals-registry";
import { SongSettings } from "../song/settings";
import { useNavigate } from "react-router";
import { RoutesEnum } from "@src/routes";

type Event =
  | {
      type: "song_settings";
      data: {
        userId: number;
        roomId?: number;
        songSettings: SongSettings;
      };
    }
  | {
      type: "song_scroll";
      data: {
        userId: number;
        roomId?: number;
        scrollPercent: number;
      };
    }
  | {
      type: "song_id";
      data: {
        userId: number;
        roomId?: number;
        songId: string;
      };
    };

export function EventsPublisher() {
  const ws = useContext(WebSocketContext);
  const userId = useSignal(Signals.userId);
  const room = useSignal(Signals.room);

  const publishSongSettings = useSignal(Signals.publishSongSettings);
  const publishSongScroll = useSignal(Signals.publishSongScroll);
  const publishSongId = useSignal(Signals.publishSongId);
  useEffect(() => {
    if (!ws || !userId || !room) {
      return;
    }
    console.debug(room);
    let event: Event | null = null;
    if (publishSongSettings) {
      event = {
        type: "song_settings",
        data: {
          userId: userId,
          roomId: room.id,
          songSettings: publishSongSettings,
        },
      };
      Signals.publishSongSettings.set(null); // Clear the signal after publishing
    }
    if (publishSongScroll) {
      event = {
        type: "song_scroll",
        data: {
          userId: userId,
          roomId: room.id,
          scrollPercent: publishSongScroll,
        },
      };
      Signals.publishSongScroll.set(null); // Clear the signal after publishing
    }
    if (publishSongId) {
      event = {
        type: "song_id",
        data: {
          userId: userId,
          roomId: room.id,
          songId: publishSongId,
        },
      };
      Signals.publishSongId.set(null); // Clear the signal after publishing
    }
    if (event) {
      ws.send(JSON.stringify(event));
      console.debug("Published:", event);
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
      const dto = JSON.parse(event.data) as Event;
      if (!dto || !dto.data || !dto.type) {
        console.warn("Received invalid event data:", dto);
        return;
      }
      if (dto.data?.userId == userId) {
        console.warn("Ignoring message from self:", dto);
        return;
      }
      if (dto.data.roomId != room.id) {
        console.warn("Received song settings for a different room:", dto);
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
