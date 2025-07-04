export const IsDev = import.meta.env.VITE_DEV == "true";
export const ApiUri = import.meta.env.VITE_API_URI;
export const SSLSuffix = import.meta.env.VITE_API_SSL == "true" ? "s" : "";
export const ApiHttpUrl = `http${SSLSuffix}://${ApiUri}`;
export const ApiWsUrl = `ws${SSLSuffix}://${ApiUri}`;
export const AutoScrollSpeed = parseInt(import.meta.env.VITE_AUTO_SCROLL_SPEED || "50", 10);
export const AutoScrollInterval = parseInt(import.meta.env.VITE_AUTO_SCROLL_INTERVAL || "2000", 10);
export const AutoScrollEnabled = import.meta.env.VITE_AUTO_SCROLL_ENABLED == "true";
