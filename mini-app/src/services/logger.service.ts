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
  }

  static log(...args: any[]) {
    console.log(...args);
    sendLogToServer("log", ...args);
  }
}
