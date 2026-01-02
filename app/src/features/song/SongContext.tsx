import { notifications } from "@mantine/notifications";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { Config } from "@src/config";
import { CreateSongParams, SongEntity, UpdateSongParams, useSongsApi } from "@src/hooks/Api";
import { ChordProService } from "@src/services/chordpro/chordpro";

export interface AutoScrollOptions {
  enabled?: boolean;
  speed?: number; // Speed in percents (1-100)
  interval?: number; // Interval in milliseconds
  position?: number; // Current scroll position in percents
}

interface DisplayOptions {
  mode?: "render" | "editor";
  transpose?: number; // Transpose value in semitones
  fontSize?: number; // Font size in pixels
}

interface SongContextType {
  // STATE
  songId?: number;
  loadedSong?: SongEntity;
  songSheet?: string; // For current song display and editing
  newSheet?: string; // For new song
  displayOptions?: DisplayOptions;
  autoScrollOptions?: AutoScrollOptions;
  scrollPosition?: number; // Current scroll position in percents
  applyScrollPosition?: number;

  // BASIC UPDATE
  setSongId: (id: number) => void;
  setLoadedSong: (song: SongEntity) => void;
  setSongSheet: (sheet: string) => void;
  setNewSheet: (sheet: string) => void;
  setDisplayOptions: (options: DisplayOptions) => void;
  setAutoScrollOptions: (options: AutoScrollOptions) => void;
  setScrollPosition: (position: number) => void;
  setApplyScrollPosition: (position: number) => void;

  // OPTIONS
  updateDisplayOptions(options: Partial<DisplayOptions>): void;
  updateAutoScrollOptions(options: Partial<AutoScrollOptions>): void;

  // ACTIONS
  openNewEditor(): void;
  loadSong(songId: number): void;
  openSong(): () => void;
  openEditor(): () => void;

  createSong(song: CreateSongParams): Promise<SongEntity>;
  updateSong(song: UpdateSongParams): Promise<SongEntity>;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export function SongContextProvider({ children }: { children: ReactNode }) {
  const [songId, setSongId] = useState<number | undefined>(undefined);
  const [loadedSong, setLoadedSong] = useState<SongEntity | undefined>(undefined);
  const [songSheet, setSongSheet] = useState<string | undefined>(undefined);
  const [newSheet, setNewSheet] = useState<string | undefined>(undefined);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions | undefined>({
    mode: "render",
    transpose: 0,
    fontSize: Config.SongFontSize,
  });
  const [autoScrollOptions, setAutoScrollOptions] = useState<AutoScrollOptions | undefined>({
    enabled: false,
    speed: Config.AutoScrollSpeed,
    interval: Config.AutoScrollInterval,
  });
  const [scrollPosition, setScrollPosition] = useState<number | undefined>(undefined);
  const [applyScrollPosition, setApplyScrollPosition] = useState<number | undefined>(undefined);

  const songsApi = useSongsApi();

  const navigate = useNavigate();

  const loadStateFromLocalStorage = useCallback(() => {
    const savedState = localStorage.getItem("songState");
    if (savedState) {
      const {
        songId,
        loadedSong,
        songSheet,
        newSheet,
        displayOptions,
        autoScrollOptions,
        scrollPosition,
        applyScrollPosition,
      } = JSON.parse(savedState);
      setSongId(songId);
      setLoadedSong(loadedSong);
      setSongSheet(songSheet);
      setNewSheet(newSheet);
      setDisplayOptions(displayOptions);
      setAutoScrollOptions(autoScrollOptions);
      setScrollPosition(scrollPosition);
      setApplyScrollPosition(applyScrollPosition);
      console.debug("Loaded song state from localStorage");
    }
  }, []);

  const saveStateToLocalStorage = useCallback(() => {
    const songState = {
      songId,
      loadedSong,
      songSheet,
      newSheet,
      displayOptions,
      autoScrollOptions,
      scrollPosition,
      applyScrollPosition,
    };
    localStorage.setItem("songState", JSON.stringify(songState));
  }, [songId, loadedSong, songSheet, newSheet, displayOptions, autoScrollOptions, scrollPosition, applyScrollPosition]);

  // Load state from localStorage if available
  // On exit, save state to localStorage
  useEffect(() => {
    loadStateFromLocalStorage();
    return () => {
      saveStateToLocalStorage();
    };
  }, []);

  // OPTIONS
  const updateDisplayOptions = useCallback((options: Partial<DisplayOptions>) => {
    setDisplayOptions((prev) => ({ ...prev, ...options }));
  }, []);
  const updateAutoScrollOptions = useCallback((options: Partial<AutoScrollOptions>) => {
    setAutoScrollOptions((prev) => ({ ...prev, ...options }));
  }, []);

  // ACTIONS
  const openNewEditor = useCallback(() => {
    setSongId(undefined);
    setLoadedSong(undefined);
    setSongSheet(undefined);
    setDisplayOptions((prev) => ({
      mode: "editor",
      transpose: 0,
      fontSize: prev?.fontSize || Config.SongFontSize,
    }));
    setAutoScrollOptions({
      enabled: false,
    });
    navigate(RoutesEnum.Editor);
  }, [navigate]);

  const loadSong = useCallback(
    (songId: number) => {
      if (!songId) {
        console.warn("loadSong called with no songId");
        return;
      }
      if (!songsApi) {
        console.error("loadSong called without SongsApiContext");
        return;
      }
      console.debug("Fetching song with ID:", songId);
      songsApi
        .getSongByID({ id: songId })
        .then((s) => {
          setSongId(songId);
          setLoadedSong(s);
          setSongSheet(s.sheet);
          setDisplayOptions((prev) => ({
            mode: "render",
            transpose: 0,
            fontSize: prev?.fontSize || Config.SongFontSize,
          }));
          setAutoScrollOptions({
            enabled: false,
          });

          navigate(RoutesEnum.Songs(songId));
        })
        .catch(console.error);
    },
    [songsApi, navigate],
  );

  const openEditor = useCallback(() => {
    return () => {
      setDisplayOptions((prev) => ({
        ...prev,
        mode: "editor",
      }));
      setAutoScrollOptions({
        enabled: false,
      });
      navigate(RoutesEnum.Editor);
    };
  }, [navigate]);

  const openSong = useCallback(() => {
    return () => {
      setDisplayOptions((prev) => ({
        ...prev,
        mode: "render",
      }));
      if (songId) {
        navigate(RoutesEnum.Songs(songId));
      } else {
        console.warn("openSong called without songId");
      }
    };
  }, [navigate, songId]);

  const createSong = useCallback(
    (params: CreateSongParams): Promise<SongEntity> => {
      if (!songsApi) {
        return Promise.reject(new Error("SongsApiContext is not available"));
      }
      if (!params.song.lyrics) {
        params.song.lyrics = ChordProService.extractLyrics(params.song.sheet || "");
      }
      return songsApi.createSong(params).then((createdSong) => {
        // notifications.show({
        //   title: "Song Created",
        //   message: `Song "${createdSong.title}" has been successfully created`,
        //   color: "green",
        //   position: "top-right",
        // });
        setSongId(createdSong.id);
        setLoadedSong(createdSong);
        setSongSheet(createdSong.sheet);
        setNewSheet(""); // Clear editor sheet
        localStorage.setItem("editor-sheet", ""); // Clear editor sheet in localStorage

        navigate(RoutesEnum.Songs(createdSong.id));
        return createdSong;
      });
    },
    [songsApi, navigate],
  );

  const updateSong = useCallback(
    (params: UpdateSongParams): Promise<SongEntity> => {
      if (!songsApi) {
        return Promise.reject(new Error("SongsApiContext is not available"));
      }
      if (!params.song.lyrics) {
        params.song.lyrics = ChordProService.extractLyrics(params.song.sheet || "");
      }
      return songsApi.updateSong(params).then((updatedSong) => {
        notifications.show({
          title: "Song updated",
          message: `Song "${updatedSong.title}" has been successfully updated`,
          color: "green",
          position: "top-right",
        });
        setLoadedSong(updatedSong);
        setSongSheet(updatedSong.sheet);
        return updatedSong;
      });
    },
    [songsApi],
  );

  return (
    <SongContext.Provider
      value={{
        songId,
        loadedSong,
        songSheet,
        newSheet,
        displayOptions,
        autoScrollOptions,
        scrollPosition,
        applyScrollPosition,
        setSongId,
        setLoadedSong,
        setSongSheet,
        setNewSheet,
        setDisplayOptions,
        setAutoScrollOptions,
        setScrollPosition,
        setApplyScrollPosition,

        updateDisplayOptions,
        updateAutoScrollOptions,

        openNewEditor,
        loadSong,
        openSong,
        openEditor,
        createSong,
        updateSong,
      }}
    >
      {children}
    </SongContext.Provider>
  );
}

export function useSongContext() {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error("useSongContext must be used within a SongContextProvider");
  }
  return context;
}

// // Custom hook that excludes scroll position to prevent unnecessary re-renders
// export function useSongContextWithoutScroll() {
//   const context = useContext(SongContext);
//   if (!context) {
//     throw new Error("useSongContextWithoutScroll must be used within a SongContextProvider");
//   }

//   // Create a version of songState without scroll-related fields
//   const { scrollPosition, applyScrollPosition, ...songStateWithoutScroll } = context.songState;

//   return {
//     ...context,
//     songState: songStateWithoutScroll,
//   };
// }
