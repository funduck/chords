import { Signals } from "@src/signals-registry";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

function WebSocketConnection() {
  const accessToken = useSignal(Signals.accessToken);
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    console.log("Connecting to WS events");

    // Pass the token as a query parameter for authentication
    const url = new URL(`/api/ws?state=${accessToken}`, window.location.origin);
    const ws = new WebSocket(url.toString());

    ws.onopen = () => {
      console.log("WS events connected");
      Signals.wsEventsConnected.set(true);
    };

    ws.onclose = () => {
      console.log("WS events disconnected");
      Signals.wsEventsConnected.set(false);
    };

    ws.onmessage = (event) => {
      console.log("WS Message", event.data);

      // TODO: Handle the message based on your application's requirements
    };

    return () => {
      ws.close();
    };
  }, [accessToken]);

  return <></>;
}

export default WebSocketConnection;
