import { ApiWsUrl } from "@src/config";
import { Signals } from "@src/signals-registry";
import { useSignal } from "@telegram-apps/sdk-react";
import { createContext, ReactNode, useEffect, useState } from "react";

export const WebSocketContext = createContext<WebSocket | null>(null);

export function WSProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    console.log("Connecting to WS...");

    // Pass the token as a query parameter for authentication
    const url = new URL(`${ApiWsUrl}/api/ws?state=${accessToken}`);
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
