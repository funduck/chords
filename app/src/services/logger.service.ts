import { notifications } from "@mantine/notifications";

import { Config } from "@src/config";

const sessionId = crypto.randomUUID().substring(0, 8); // Generate a short session ID

function sendLogToServer(level: string, ...args: any[]) {
  const body = JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    sessionId,
    message: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
  });

  fetch(Config.ApiHttpUrl + "/log", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": body.length.toString(),
    },
    body,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Failed to send log to server:", response.statusText);
      }
    })
    .catch((error) => {
      console.error("Error sending log to server:", error);
    });
}

export class Logger {
  static error(...args: any[]) {
    console.error(...args);
    sendLogToServer("error", ...args);
    notifications.show({
      title: "Error",
      message: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
      color: "red",
      autoClose: 10000,
      position: "top-right",
    });
  }

  static log(...args: any[]) {
    console.log(...args);
    sendLogToServer("log", ...args);
  }
}
