import { useSignal } from "@telegram-apps/sdk-react";
import { ReactNode, createContext, useEffect, useState } from "react";

import { ApiHttpUrl } from "@src/config";
import {
  AuthApi,
  ChordsComApiInternalEntityRoom,
  ChordsComApiInternalEntitySong,
  ChordsComApiInternalEntitySongInfo,
  Configuration,
  LibraryApi,
  RoomsApi,
  SongsApi,
} from "@src/generated/api";
import { Signals } from "@src/services/signals-registry";

export const AuthApiContext = createContext<AuthApi | null>(null);
export const RoomsApiContext = createContext<RoomsApi | null>(null);
export const LibraryApiContext = createContext<LibraryApi | null>(null);
export const SongsApiContext = createContext<SongsApi | null>(null);

export type RoomEntity = ChordsComApiInternalEntityRoom;
export type SongEntity = ChordsComApiInternalEntitySong;
export type SongInfoEntity = ChordsComApiInternalEntitySongInfo;

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
    const libraryAPI = new LibraryApi(conf);
    setLibraryApi(libraryAPI);
    const songsAPI = new SongsApi(conf);
    setSongsApi(songsAPI);

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
