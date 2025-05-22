import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import "@telegram-apps/telegram-ui/dist/styles.css";

import { EnvUnsupported } from "@src/components/env-unsupported.tsx";

import "./index.css";
import { init } from "./init.ts";

// Mock the environment in case, we are outside Telegram.
import "./mock-env.ts";

export const isDev = webConfig().isDev;

import { webConfig } from "./config.ts";
import { initI18Next } from "./services/locale.service.ts";
import { Signals } from "./signals-registry.ts";
import { initTimeAgo } from "./services/timeago.service.ts";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { BrowserRouter } from "react-router";
import AppRoutes from "./routes.tsx";
import App from "./app.tsx";

const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().startParam === "debug" || isDev);

  // Set the language.
  const lang = retrieveLaunchParams().initData?.user?.languageCode || "en";
  Signals.language.set(lang);

  initI18Next({ isDev, languageCode: lang });

  initTimeAgo(lang);

  root.render(
    <StrictMode>
      <AppRoot>
        <BrowserRouter>
          <AppRoutes />
          <App />
        </BrowserRouter>
      </AppRoot>
    </StrictMode>,
  );
} catch (e) {
  root.render(<EnvUnsupported />);
}
