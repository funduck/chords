import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter } from "react-router";

import Router from "./Router";
import AnonymousLogin from "./features/connection/anonymous-login";
import { ApiProvider } from "./hooks/api";
import { EventsConsumer, EventsPublisher } from "./hooks/events";
import { RoomServiceProvider } from "./hooks/room-service";
import { WebSocketProvider } from "./hooks/websocket";
import "./index.css";
import { theme } from "./theme";

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <BrowserRouter>
        <ApiProvider>
          <WebSocketProvider>
            <RoomServiceProvider>
              <EventsPublisher />
              <EventsConsumer />
              <AnonymousLogin />
              <Router />
            </RoomServiceProvider>
          </WebSocketProvider>
        </ApiProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
