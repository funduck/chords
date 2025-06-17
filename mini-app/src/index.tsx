import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import { EnvUnsupported } from "@components/env-unsupported.tsx";

import App from "./app.tsx";
import { IsDev } from "./config.ts";
import { ApiProvider } from "./hooks/api.tsx";
import { WebSocketProvider } from "./hooks/websocket.tsx";
import "./index.css";
import { init } from "./init.ts";
// Mock the environment in case, we are outside Telegram.
import "./mock-env.ts";
import AppRoutes from "./routes.tsx";
import { Signals } from "./signals-registry.ts";

const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().startParam === "debug" || IsDev);

  // Set the language.
  const lang = retrieveLaunchParams().initData?.user?.languageCode || "en";
  Signals.language.set(lang);

  root.render(
    <StrictMode>
      <AppRoot>
        <ApiProvider>
          <WebSocketProvider>
            <BrowserRouter>
              <AppRoutes />
              <App />
            </BrowserRouter>
          </WebSocketProvider>
        </ApiProvider>
      </AppRoot>
    </StrictMode>,
  );
} catch (e) {
  root.render(<EnvUnsupported />);
}
