export const IsDev = import.meta.env.VITE_DEV == "true";
export const ApiUri = import.meta.env.VITE_API_URI;
export const SSLSuffix = import.meta.env.VITE_API_SSL == "true" ? "s" : "";
export const ApiHttpUrl = `http${SSLSuffix}://${ApiUri}`;
export const ApiWsUrl = `ws${SSLSuffix}://${ApiUri}`;
