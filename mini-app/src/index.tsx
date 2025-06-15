import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import "@telegram-apps/telegram-ui/dist/styles.css";

import { EnvUnsupported } from "@src/components/env-unsupported.tsx";

import "./index.css";
import { init } from "./init.ts";

// Mock the environment in case, we are outside Telegram.
import "./mock-env.ts";

import { Signals } from "./signals-registry.ts";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes.tsx";
import App from "./app.tsx";
import { IsDev } from "./config.ts";
import { WSProvider } from "./features/connection/ws-connection.tsx";
import { ApiProvider } from "./features/connection/api-connection.tsx";
import { AppRoot } from "@telegram-apps/telegram-ui";

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
          <WSProvider>
            <BrowserRouter>
              <AppRoutes />
              <App />
            </BrowserRouter>
          </WSProvider>
        </ApiProvider>
      </AppRoot>
    </StrictMode>,
  );
} catch (e) {
  root.render(<EnvUnsupported />);
}
