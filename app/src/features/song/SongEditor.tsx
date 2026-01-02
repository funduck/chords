import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSignal } from "@telegram-apps/sdk-react";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import CodeMirror from "@uiw/react-codemirror";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Signals } from "@src/services/signals-registry";

import NewSongForm from "./NewSongForm";
import { useSongContext } from "./SongContext";

const SongEditor = memo(({ currentSong }: { currentSong?: boolean }) => {
  console.debug("rendering SongEditor");

  const userId = useSignal(Signals.userId);

  const { songSheet, newSheet, loadedSong, displayOptions, setSongSheet, setNewSheet, setSongId } = useSongContext();
  const fontSize = displayOptions?.fontSize || 16;

  const [localValue, setLocalValue] = useState("");

  const editorValueKey = `editor-sheet-${currentSong}`;

  // Loads editor value from local storage
  const loadLocalValue = useCallback(() => {
    const value = localStorage.getItem(editorValueKey);
    if (value && value.length) {
      return value;
    }
    return "";
  }, []);

  // Store editor value to local storage
  const storeLocalValue = useCallback((value: string) => {
    localStorage.setItem(editorValueKey, value);
  }, []);

  // Change editor value
  const setEditorValue = useCallback((value: string) => {
    console.debug("SongEditor: setting editor value", value.length);
    setLocalValue(value);
    storeLocalValue(value);
  }, []);

  // Update song state in context
  const updateSongSheet = useCallback(
    (value: string) => {
      console.debug("SongEditor: updateSongSheet", value.length);
      if (currentSong) {
        setSongSheet(value);
      } else {
        setNewSheet(value);
      }
    },
    [currentSong, setSongSheet, setNewSheet],
  );

  const [autoSaveInSeconds, setAutoSaveInSeconds] = useState(0);

  // Handle editor changes with debounce
  const autoSaveInterval = useRef(null as ReturnType<typeof setInterval> | null);
  const autoSaveIntervalRef = useRef(0);

  const isKeyPressedRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = () => {
      isKeyPressedRef.current = true;
    };

    const handleKeyUp = () => {
      isKeyPressedRef.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const emitSheetChanged = useCallback(
    (
      value: string,
      options: { updateSongState: boolean; debounce: boolean } = { updateSongState: true, debounce: true },
    ) => {
      console.debug("SongEditor: emitSheetChanged", value.length, options);

      autoSaveIntervalRef.current = options.debounce ? 3 : 0;
      setAutoSaveInSeconds(autoSaveIntervalRef.current);

      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }

      if (!options.debounce) {
        storeLocalValue(value);
        if (options.updateSongState) {
          updateSongSheet(value);
        }
        setAutoSaveInSeconds(0);
        return;
      }

      autoSaveInterval.current = setInterval(() => {
        // If keypressed delay saving
        if (isKeyPressedRef.current) {
          autoSaveIntervalRef.current = 3;
          setAutoSaveInSeconds(autoSaveIntervalRef.current);
          return;
        }

        // If already saved, return
        if (autoSaveIntervalRef.current == 0) {
          clearInterval(autoSaveInterval.current!);
          autoSaveInterval.current = null;
          return;
        }

        // If not changed, clear interval
        if (value == songSheet) {
          clearInterval(autoSaveInterval.current!);
          autoSaveInterval.current = null;
          setAutoSaveInSeconds(0);
          return;
        }

        // Iterate countdown
        autoSaveIntervalRef.current--;
        setAutoSaveInSeconds(autoSaveIntervalRef.current);

        // If countdown reached zero, save
        if (autoSaveIntervalRef.current == 0) {
          storeLocalValue(value);
          if (options.updateSongState) {
            updateSongSheet(value);
          }
          return;
        }
      }, 1000);
    },
    [storeLocalValue, updateSongSheet, songSheet],
  );

  // Initializes the editor with the current song sheet or new sheet
  // Loads the sheet from localStorage if not provided
  useEffect(() => {
    if (!setEditorValue) {
      return;
    }

    console.debug(
      `SongEditor: useEffect: ${currentSong} ${songSheet?.length} ${newSheet?.length} ${localValue.length}`,
    );

    if (currentSong) {
      if (songSheet && songSheet != localValue) {
        console.debug("SongEditor: useEffect: songSheet");
        setEditorValue(songSheet);
        emitSheetChanged(songSheet, { updateSongState: false, debounce: false });
        return;
      }
    } else {
      if (newSheet && newSheet != localValue) {
        console.debug("SongEditor: useEffect: newSheet");
        setEditorValue(newSheet);
        emitSheetChanged(newSheet, { updateSongState: false, debounce: false });
        return;
      }
    }

    const storedSheet = loadLocalValue();
    if (storedSheet && storedSheet != localValue) {
      console.debug("SongEditor: useEffect: localStorage", storedSheet.length);
      setEditorValue(storedSheet);
      emitSheetChanged(storedSheet, { updateSongState: false, debounce: false });
    }
  }, [currentSong, songSheet, newSheet, setEditorValue, loadLocalValue, emitSheetChanged]);

  // // Handles changes to the song sheet from outside the editor
  // useEffect(() => {
  //   if (!setEditorValue) {
  //     return;
  //   }
  //   // If new value equals to localValue, do nothing

  //   if (currentSong && songState.songSheet && songState.songSheet !== localValue) {
  //     console.log("SongEditor: useEffect: songState.songSheet changed");

  //     // Update savedSheet when songSheet changes
  //     setSavedSheet(songState.songSheet);

  //     setEditorValue(songState.songSheet);
  //     emitSheetChanged(songState.songSheet, { updateSongState: false, debounce: false });
  //   }

  //   if (!currentSong && songState.newSheet && songState.newSheet !== localValue) {
  //     console.log("SongEditor: useEffect: songState.newSheet changed");

  //     setEditorValue(songState.newSheet);
  //     emitSheetChanged(songState.newSheet, { updateSongState: false, debounce: false });
  //   }
  // }, [setEditorValue, currentSong, songState.songSheet, songState.newSheet]);

  // Save sheet action
  const [savedSheet, setSavedSheet] = useState("");
  const saveSheetAction = useCallback(() => {
    setSavedSheet(localValue);
    setSongId(loadedSong!.id);
    setSongSheet(localValue);
  }, [setSavedSheet, setSongId, setSongSheet, localValue, loadedSong]);

  const formatSheetAction = useCallback(
    (format: "chordpro") => {
      const song = ChordProService.sheetToSong(localValue, {});
      if (!song) {
        notifications.show({
          title: "Error",
          message: "Failed to parse sheet",
          color: "red",
          position: "top-right",
        });
        return;
      }
      const formatted = ChordProService.songToSheet(song, { format });
      if (!formatted) {
        notifications.show({
          title: "Error",
          message: "Failed to format song",
          color: "red",
          position: "top-right",
        });
        return;
      }

      setEditorValue(formatted);
      emitSheetChanged(formatted, { updateSongState: true, debounce: false });
      notifications.show({
        title: "Success",
        message: `Song formatted to ${format}`,
        color: "green",
        position: "top-right",
      });
    },
    [setEditorValue, emitSheetChanged, localValue],
  );

  const clearSheetAction = useCallback(() => {
    setEditorValue("");
    emitSheetChanged("", { updateSongState: true, debounce: false });
  }, [setEditorValue, emitSheetChanged]);

  // Handle editor content changes
  const onEditorChange = useCallback(
    (value) => {
      console.log("SongEditor: onEditorChange", value.length);
      setLocalValue(value);
      storeLocalValue(value);
      emitSheetChanged(value, { updateSongState: true, debounce: true });
    },
    [emitSheetChanged],
  );

  return (
    <>
      <Group mb="md">
        {!currentSong && <NewSongForm sheetValue={localValue || ""} />}

        {currentSong && loadedSong?.owner_id == userId && (
          <>
            <Button variant="outline" onClick={saveSheetAction} disabled={savedSheet === localValue}>
              Save
            </Button>
          </>
        )}

        <Button variant="outline" onClick={() => formatSheetAction("chordpro")}>
          Format
        </Button>

        <Button variant="outline" onClick={clearSheetAction} disabled={"" === localValue}>
          Clear
        </Button>

        {autoSaveInSeconds > 0 && (
          <span style={{ color: "orange" }}>Auto-saving in {autoSaveInSeconds} seconds...</span>
        )}
      </Group>

      <CodeMirror value={localValue} onChange={onEditorChange} theme={okaidia} style={{ fontSize: `${fontSize}px` }} />
    </>
  );
});

export default SongEditor;
