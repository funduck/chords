import { useContext, useEffect } from "react";
import { WebSocketContext } from "./ws-connection";
import { useSignal } from "@telegram-apps/sdk-react";
import { Signals } from "@src/signals-registry";
import { SongSettings } from "../song/settings";

type Event = {
  type: "song_settings";
  data: {
    userId: number;
    roomId?: number;
    songSettings: SongSettings;
  };
};

export function EventsPublisher() {
  const ws = useContext(WebSocketContext);
  const userId = useSignal(Signals.userId);
  const room = useSignal(Signals.room);

  // Publishing song settings to the WebSocket server
  const publishSongSettings = useSignal(Signals.publishSongSettings);
  useEffect(() => {
    if (!ws || !userId || !room) {
      return;
    }
    if (publishSongSettings) {
      const event: Event = {
        type: "song_settings",
        data: {
          userId: userId,
          roomId: room.id,
          songSettings: publishSongSettings,
        },
      };
      ws.send(JSON.stringify(event));
      Signals.publishSongSettings.set(null); // Clear the signal after publishing
    }
  }, [ws, userId, room, publishSongSettings]);

  return <></>;
}

export function EventsConsumer() {
  const ws = useContext(WebSocketContext);
  const userId = useSignal(Signals.userId);
  const room = useSignal(Signals.room);

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

      switch (dto.type) {
        case "song_settings": {
          if (dto.data.roomId != room.id) {
            console.warn("Received song settings for a different room:", dto);
            return;
          }
          console.log("Received song settings:", dto.data.songSettings);
          Signals.applySongSettings.set(new SongSettings().fromJson(dto.data.songSettings));
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
