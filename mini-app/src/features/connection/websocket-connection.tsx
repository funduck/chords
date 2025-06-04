import { ApiWsUrl } from "@src/config";
import { Signals } from "@src/signals-registry";
import { useSignal } from "@telegram-apps/sdk-react";
import React, { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);
  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    console.log("Connecting to WS...");

    // Pass the token as a query parameter for authentication
    const url = new URL(`${ApiWsUrl}/api/ws?state=${accessToken}`);
    ws.current = new WebSocket(url.toString());

    ws.current.onopen = () => {
      console.log("WS connected");
      Signals.wsEventsConnected.set(true);
    };

    ws.current.onclose = () => {
      console.log("WS disconnected");
      Signals.wsEventsConnected.set(false);
    };

    ws.current.onmessage = (event) => {
      console.log("WS Message", event.data);

      // TODO: Handle the message based on your application's requirements
    };

    return () => {
      console.log("WS closing...");
      ws.current?.close();
    };
  }, [accessToken]);

  // Connecting listeners
  const songSettings = useSignal(Signals.settingsSong);
  useEffect(() => {
    console.log(`Sending song settings to WS: ${!!ws}`);
    ws.current?.send(
      JSON.stringify({
        type: "song_settings",
        data: songSettings,
      }),
    );
  }, [songSettings]);

  return <WebSocketContext.Provider value={ws.current}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const ws = useContext(WebSocketContext);
  // if (!ws) {
  //   throw new Error("useWebSocket must be used within WebSocketProvider");
  // }
  return ws;
};

function WebSocketListeners() {
  // const ws = useWebSocket();

  // const songSettings = useSignal(Signals.settingsSong);
  // useEffect(() => {
  //   console.log(`Sending song settings to WS: ${!!ws}`);
  //   ws?.send(
  //     JSON.stringify({
  //       type: "song_settings",
  //       data: songSettings,
  //     }),
  //   );
  // }, [songSettings]);

  return <></>;
}

function WebSocketConnection() {
  return (
    <WebSocketProvider>
      <WebSocketListeners />
    </WebSocketProvider>
  );
}

export default WebSocketConnection;
