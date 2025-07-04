import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useEffect, useState } from "react";

import { ApiHttpUrl } from "@src/config";
import {
  AuthApi,
  ChordsComApiInternalDtoSongInfo,
  ChordsComApiInternalEntityRoom,
  ChordsComApiInternalEntitySong,
  Configuration,
  LibraryApi,
  RoomsApi,
  SongsApi,
} from "@src/generated/api";
import { Logger } from "@src/services/logger.service";
import { Signals } from "@src/services/signals-registry";

export const AuthApiContext = createContext<AuthApi | null>(null);
export const RoomsApiContext = createContext<RoomsApi | null>(null);
export const LibraryApiContext = createContext<LibraryApi | null>(null);
export const SongsApiContext = createContext<SongsApi | null>(null);

export type RoomEntity = ChordsComApiInternalEntityRoom;
export type SongEntity = ChordsComApiInternalEntitySong;
export type SongInfoEntity = ChordsComApiInternalDtoSongInfo;

export function ApiProvider({ children }: { children: ReactNode }) {
  const [authApi, setAuthApi] = useState<AuthApi | null>(null);
  const [roomsApi, setRoomsApi] = useState<RoomsApi | null>(null);
  const [libraryApi, setLibraryApi] = useState<LibraryApi | null>(null);
  const [songsApi, setSongsApi] = useState<SongsApi | null>(null);
  const accessToken = useSignal(Signals.accessToken);

  useEffect(() => {
    console.log("Connecting to public API...");
    const conf = new Configuration({
      basePath: ApiHttpUrl,
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
      basePath: ApiHttpUrl,
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
    const libraryAPI = new LibraryApi(conf);
    setLibraryApi(libraryAPI);
    const songsAPI = new SongsApi(conf);
    setSongsApi(songsAPI);

    Logger.log("Private API connected");

    return () => {
      console.log("Private API closing...");
      setRoomsApi(null);
      setLibraryApi(null);
      setSongsApi(null);
    };
  }, [accessToken]);

  return (
    <AuthApiContext.Provider value={authApi}>
      <RoomsApiContext.Provider value={roomsApi}>
        <LibraryApiContext.Provider value={libraryApi}>
          <SongsApiContext.Provider value={songsApi}>{children}</SongsApiContext.Provider>
        </LibraryApiContext.Provider>
      </RoomsApiContext.Provider>
    </AuthApiContext.Provider>
  );
}
