import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { RoutesEnum } from "@src/Router";
import { Config } from "@src/config";
import { CreateSongParams, SongEntity, UpdateSongParams, useSongsApi } from "@src/hooks/Api";

export interface AutoScrollOptions {
  enabled?: boolean;
  speed?: number; // Speed in percents (1-100)
  interval?: number; // Interval in milliseconds
  position?: number; // Current scroll position in percents
}

interface DisplayOptions {
  mode?: "render" | "editor";
  transpose?: number; // Transpose value in semitones
}

interface SongState {
  songId?: number;
  loadedSong?: SongEntity;
  songSheet?: string; // For current song display and editing
  newSheet?: string; // For new song
  displayOptions?: DisplayOptions;
  autoScrollOptions?: AutoScrollOptions;
  scrollPosition?: number; // Current scroll position in percents
  applyScrollPosition?: number;
}

interface SongContextType {
  // STATE
  songState: SongState;

  // BASIC UPDATE
  updateSongState(updates: Partial<SongState>): void;

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
  const [songState, setSongState] = useState<SongState>({
    autoScrollOptions: {
      enabled: false,
      speed: Config.AutoScrollSpeed,
      interval: Config.AutoScrollInterval,
    },
    displayOptions: {
      mode: "render",
      transpose: 0,
    },
  });

  const songsApi = useSongsApi();

  const navigate = useNavigate();

  const loadStateFromLocalStorage = () => {
    const savedState = localStorage.getItem("songState");
    if (savedState) {
      setSongState(JSON.parse(savedState));
    }
  };
  const saveStateToLocalStorage = () => {
    localStorage.setItem("songState", JSON.stringify(songState));
  };
  // Load state from localStorage if available
  useEffect(() => {
    loadStateFromLocalStorage();
    return () => {
      saveStateToLocalStorage();
    };
  }, []);

  // BASIC UPDATE
  function updateSongState(updates: Partial<SongState>) {
    setSongState((prev) => {
      const newState: SongState = {
        ...prev,
        ...updates,
        displayOptions: { ...(prev.displayOptions ?? {}), ...(updates.displayOptions ?? {}) },
        autoScrollOptions: { ...(prev.autoScrollOptions ?? {}), ...(updates.autoScrollOptions ?? {}) },
      };
      localStorage.setItem("songState", JSON.stringify(newState));
      return newState;
    });
  }

  // OPTIONS
  function updateDisplayOptions(options: Partial<DisplayOptions>) {
    updateSongState({ displayOptions: options });
  }
  function updateAutoScrollOptions(options: Partial<AutoScrollOptions>) {
    updateSongState({ autoScrollOptions: options });
  }

  // ACTIONS
  function openNewEditor() {
    updateSongState({
      songId: undefined,
      loadedSong: undefined,
      songSheet: undefined,
      displayOptions: {
        mode: "editor",
        transpose: 0,
      },
      autoScrollOptions: {
        enabled: false,
      },
    });
    navigate(RoutesEnum.Editor);
  }
  function loadSong(songId: number) {
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
        updateSongState({
          songId,
          loadedSong: s,
          songSheet: s.sheet,
          displayOptions: {
            mode: "render",
            transpose: 0,
          },
          autoScrollOptions: {
            enabled: false,
          },
        });
        navigate(RoutesEnum.Songs(songId));
      })
      .catch(console.error);
  }
  function openEditor() {
    return () => {
      updateSongState({
        displayOptions: {
          mode: "editor",
        },
        autoScrollOptions: {
          enabled: false,
        },
      });
      navigate(RoutesEnum.Editor);
    };
  }
  function openSong() {
    return () => {
      updateSongState({
        displayOptions: {
          mode: "render",
        },
      });
      if (songState.songId) {
        navigate(RoutesEnum.Songs(songState.songId));
      } else {
        console.warn("openSong called without songId");
      }
    };
  }

  function createSong(params: CreateSongParams): Promise<SongEntity> {
    if (!songsApi) {
      return Promise.reject(new Error("SongsApiContext is not available"));
    }
    return songsApi.createSong(params).then((createdSong) => {
      updateSongState({
        songId: createdSong.id,
        loadedSong: createdSong,
        songSheet: createdSong.sheet,
      });
      navigate(RoutesEnum.Songs(createdSong.id));
      return createdSong;
    });
  }

  function updateSong(params: UpdateSongParams): Promise<SongEntity> {
    if (!songsApi) {
      return Promise.reject(new Error("SongsApiContext is not available"));
    }
    return songsApi.updateSong(params).then((updatedSong) => {
      updateSongState({
        loadedSong: updatedSong,
        songSheet: updatedSong.sheet,
      });
      return updatedSong;
    });
  }

  return (
    <SongContext.Provider
      value={{
        songState,
        updateSongState,
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
