import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { BrowserRouter } from "react-router";

import Router from "./Router";
import AnonymousLogin from "./features/auth/AnonymousLogin";
import { SearchProvider } from "./features/search/SearchContext";
import { SongContextProvider } from "./features/song/SongContext";
import { ApiProvider } from "./hooks/Api";
import { EventsConsumer, EventsPublisher } from "./hooks/Events";
import { HeaderProvider } from "./hooks/Header";
import { RoomServiceProvider } from "./hooks/RoomService";
import { WebSocketProvider } from "./hooks/WebSocket";
import "./index.css";
import { theme } from "./theme";

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <BrowserRouter>
        <ApiProvider>
          <WebSocketProvider>
            <RoomServiceProvider>
              <SongContextProvider>
                <HeaderProvider>
                  <SearchProvider>
                    <EventsPublisher />
                    <EventsConsumer />
                    <AnonymousLogin />
                    <Router />
                  </SearchProvider>
                </HeaderProvider>
              </SongContextProvider>
            </RoomServiceProvider>
          </WebSocketProvider>
        </ApiProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
