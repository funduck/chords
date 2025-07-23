import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

import { Config } from "@src/config";
import {
  ArtistsApi,
  AuthApi,
  ChordsComApiInternalEntityArtistInfo,
  ChordsComApiInternalEntityAuth,
  ChordsComApiInternalEntityRoom,
  ChordsComApiInternalEntitySong,
  ChordsComApiInternalEntitySongInfo,
  Configuration,
  RoomsApi,
  SongsApi,
  UserApi,
} from "@src/generated/api";
import { Logger } from "@src/services/logger.service";
import { Signals } from "@src/services/signals-registry";

interface PublicApiContextType {
  authApi: AuthApi | null;
}

const PublicApiContext = createContext<PublicApiContextType>({ authApi: null });

interface PrivateApiContextType {
  roomsApi: RoomsApi | null;
  artistsApi: ArtistsApi | null;
  songsApi: SongsApi | null;
  userApi: UserApi | null;
}
const PrivateApiContext = createContext<PrivateApiContextType>({
  roomsApi: null,
  artistsApi: null,
  songsApi: null,
  userApi: null,
});

export type AuthEntity = ChordsComApiInternalEntityAuth;
export type RoomEntity = ChordsComApiInternalEntityRoom;
export type SongEntity = ChordsComApiInternalEntitySong;
export type SongInfoEntity = ChordsComApiInternalEntitySongInfo;
export type ArtistInfoEntity = ChordsComApiInternalEntityArtistInfo;

export type CreateSongParams = Parameters<SongsApi["createSong"]>[0];
export type UpdateSongParams = Parameters<SongsApi["updateSong"]>[0];

export function ApiProvider({ children }: { children: ReactNode }) {
  const [authApi, setAuthApi] = useState<AuthApi | null>(null);
  const [roomsApi, setRoomsApi] = useState<RoomsApi | null>(null);
  const [artistsApi, setArtistsApi] = useState<ArtistsApi | null>(null);
  const [songsApi, setSongsApi] = useState<SongsApi | null>(null);
  const [userApi, setUserApi] = useState<UserApi | null>(null);

  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    console.log("Connecting to public API...");
    const conf = new Configuration({
      basePath: Config.ApiHttpUrl,
      middleware: [
        {
          post: async (context) => {
            if (!context.response.ok) {
              Logger.error(
                "API error:",
                context.init.method,
                context.url,
                context.init.body,
                context.response.status,
                context.response.statusText,
              );
            }
            return context.response;
          },
        },
      ],
    });
    const authAPI = new AuthApi(conf);
    setAuthApi(authAPI);

    Logger.log("Public API connected");

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
      basePath: Config.ApiHttpUrl,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      // TODO middleware to refresh access token
      middleware: [
        {
          post: async (context) => {
            if (!context.response.ok) {
              Logger.error(
                "API error:",
                context.init.method,
                context.url,
                context.init.body,
                context.response.status,
                context.response.statusText,
              );
            }
            return context.response;
          },
        },
      ],
    });
    const roomsAPI = new RoomsApi(conf);
    setRoomsApi(roomsAPI);
    const artistsAPI = new ArtistsApi(conf);
    setArtistsApi(artistsAPI);
    const songsAPI = new SongsApi(conf);
    setSongsApi(songsAPI);
    const userAPI = new UserApi(conf);
    setUserApi(userAPI);

    Logger.log("Private API connected");

    return () => {
      console.log("Private API closing...");
      setRoomsApi(null);
      setArtistsApi(null);
      setSongsApi(null);
      setUserApi(null);
    };
  }, [accessToken]);

  return (
    <PublicApiContext.Provider value={{ authApi }}>
      <PrivateApiContext.Provider value={{ roomsApi, artistsApi, songsApi, userApi }}>
        {children}
      </PrivateApiContext.Provider>
    </PublicApiContext.Provider>
  );
}

export function useAuthApi() {
  const { authApi: api } = useContext(PublicApiContext);
  // if (!api) {
  //   throw new Error("Auth API is not available. Make sure to wrap your component with ApiProvider.");
  // }
  return api;
}

export function useRoomsApi() {
  const { roomsApi: api } = useContext(PrivateApiContext);
  // if (!api) {
  //   throw new Error("Rooms API is not available. Make sure to wrap your component with ApiProvider.");
  // }
  return api;
}

export function useArtistsApi() {
  const { artistsApi: api } = useContext(PrivateApiContext);
  // if (!api) {
  //   throw new Error("Artists API is not available. Make sure to wrap your component with ApiProvider.");
  // }
  return api;
}

export function useSongsApi() {
  const { songsApi: api } = useContext(PrivateApiContext);
  // if (!api) {
  //   throw new Error("Songs API is not available. Make sure to wrap your component with ApiProvider.");
  // }
  return api;
}

export function useUserApi() {
  const { userApi: api } = useContext(PrivateApiContext);
  // if (!api) {
  //   throw new Error("User API is not available. Make sure to wrap your component with ApiProvider.");
  // }
  return api;
}
