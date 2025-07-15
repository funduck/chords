import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter } from "react-router";

import Router from "./Router";
import AnonymousLogin from "./features/auth/AnonymousLogin";
import { RoomContextProvider } from "./features/room/RoomContext";
import { RoomEventsConsumer, RoomEventsPublisher } from "./features/room/RoomEvents";
import { SearchProvider } from "./features/search/SearchContext";
import { SongContextProvider } from "./features/song/SongContext";
import { ApiProvider } from "./hooks/Api";
import { HeaderProvider } from "./hooks/Header";
import { WebSocketProvider } from "./hooks/WebSocket";
import "./index.css";
import { theme } from "./theme";

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <BrowserRouter>
        <ApiProvider>
          <WebSocketProvider>
            <SongContextProvider>
              <RoomContextProvider>
                <HeaderProvider>
                  <SearchProvider>
                    <RoomEventsPublisher />
                    <RoomEventsConsumer />
                    <AnonymousLogin />
                    <Router />
                  </SearchProvider>
                </HeaderProvider>
              </RoomContextProvider>
            </SongContextProvider>
          </WebSocketProvider>
        </ApiProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
