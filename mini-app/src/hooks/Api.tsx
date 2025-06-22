import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useEffect, useState } from "react";

import { ApiHttpUrl } from "@src/config";
import { AuthApi, Configuration, RoomsApi } from "@src/generated/api";
import { Signals } from "@src/services/signals-registry";

export const AuthApiContext = createContext<AuthApi | null>(null);
export const RoomsApiContext = createContext<RoomsApi | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [authApi, setAuthApi] = useState<AuthApi | null>(null);
  const [roomsApi, setRoomsApi] = useState<RoomsApi | null>(null);
  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    console.log("Connecting to public API...");
    const conf = new Configuration({
      basePath: ApiHttpUrl,
    });
    const authAPI = new AuthApi(conf);
    setAuthApi(authAPI);

    return () => {
      console.log("Public API closing...");
      setAuthApi(null);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    console.log("Connecting to private API...");
    const conf = new Configuration({
      basePath: ApiHttpUrl,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      // TODO middleware to refresh access token
    });
    const roomsAPI = new RoomsApi(conf);
    setRoomsApi(roomsAPI);

    return () => {
      console.log("Private API closing...");
      setRoomsApi(null);
    };
  }, [accessToken]);

  return (
    <AuthApiContext.Provider value={authApi}>
      <RoomsApiContext.Provider value={roomsApi}>{children}</RoomsApiContext.Provider>
    </AuthApiContext.Provider>
  );
}
