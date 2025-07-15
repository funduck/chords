import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { Config } from "@src/config";
import { Signals } from "@src/services/signals-registry";

export const WebSocketContext = createContext<WebSocket | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    console.log("Connecting to WS...");

    // Pass the token as a query parameter for authentication
    const url = new URL(`${Config.ApiWsUrl}/api/ws?state=${accessToken}`);
    const ws = new WebSocket(url.toString());

    ws.onopen = () => {
      console.log("WS connected");
      Signals.wsEventsConnected.set(true);
      setWs(ws);
    };

    ws.onclose = () => {
      console.log("WS disconnected");
      Signals.wsEventsConnected.set(false);
      setWs(null);
    };

    // ws.onmessage = (event) => {
    //   console.log("WS Message", event.data);

    //   // TODO: Handle the message based on your application's requirements
    // };

    return () => {
      console.log("WS closing...");
      ws?.close();
      setWs(null);
    };
  }, [accessToken]);

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const ws = useContext(WebSocketContext);
  // if (!ws) {
  //   throw new Error("WebSocket is not available. Make sure to wrap your component with WebSocketProvider.");
  // }
  return ws;
}
