import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { Config } from "./config";

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (Config.StrictMode) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  root.render(<App />);
}
