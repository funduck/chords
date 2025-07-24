import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { Config } from "@src/config";
import { Signals } from "@src/services/signals-registry";

export const WebSocketContext = createContext<WebSocket | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const accessToken = useSignal(Signals.accessToken);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 1000; // Start with 1 second

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let reconnectTimeout: NodeJS.Timeout;
    let isIntentionalClose = false;

    const connect = () => {
      console.log("Connecting to WS...");

      // Pass the token as a query parameter for authentication
      const url = new URL(`${Config.ApiWsUrl}/api/ws?state=${accessToken}`);
      const ws = new WebSocket(url.toString());

      ws.onopen = () => {
        console.log("WS connected");
        Signals.wsEventsConnected.set(true);
        setWs(ws);
        setReconnectAttempt(0); // Reset reconnect attempts on successful connection
      };

      ws.onclose = (event) => {
        console.log("WS disconnected", event.code, event.reason);
        Signals.wsEventsConnected.set(false);
        setWs(null);

        // Only attempt to reconnect if it wasn't an intentional close
        if (!isIntentionalClose && reconnectAttempt < maxReconnectAttempts) {
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttempt), 30000); // Exponential backoff, max 30 seconds
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempt + 1}/${maxReconnectAttempts})`,
          );

          reconnectTimeout = setTimeout(() => {
            setReconnectAttempt((prev) => prev + 1);
            connect();
          }, delay);
        } else if (reconnectAttempt >= maxReconnectAttempts) {
          console.log("Max reconnection attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("WS error:", error);
      };

      // ws.onmessage = (event) => {
      //   console.log("WS Message", event.data);

      //   // TODO: Handle the message based on your application's requirements
      // };
    };

    connect();

    return () => {
      console.log("WS closing...");
      isIntentionalClose = true;
      clearTimeout(reconnectTimeout);
      ws?.close();
      setWs(null);
    };
  }, [accessToken, reconnectAttempt]);

  return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const ws = useContext(WebSocketContext);
  // if (!ws) {
  //   throw new Error("WebSocket is not available. Make sure to wrap your component with WebSocketProvider.");
  // }
  return ws;
}
