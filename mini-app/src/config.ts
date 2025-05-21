export function webConfig() {
  const isDev = import.meta.env.VITE_DEV == "true";
  const apiUri = import.meta.env.VITE_API_URI;
  const sslSuffix = import.meta.env.VITE_API_SSL == "true" ? "s" : "";
  const apiHttpUrl = `http${sslSuffix}://${apiUri}`;
  const apiWsUrl = `ws${sslSuffix}://${apiUri}`;

  return {
    isDev,
    apiHttpUrl,
    apiWsUrl,
  };
}
