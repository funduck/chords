import { Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSignal } from "@telegram-apps/sdk-react";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Signals } from "@src/services/signals-registry";

import NewSongForm from "./NewSongForm";
import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const userId = useSignal(Signals.userId);

  const songContext = useSongContext();
  const { songState } = songContext;

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
        songContext.updateSongState({
          songSheet: value,
        });
      } else {
        songContext.updateSongState({
          newSheet: value,
        });
      }
    },
    [currentSong, songContext],
  );

  // Handle editor changes with debounce
  const timer = useRef(null as ReturnType<typeof setTimeout> | null);
  const emitSheetChanged = useCallback(
    (
      value: string,
      options: { updateSongState: boolean; debounce: boolean } = { updateSongState: true, debounce: true },
    ) => {
      console.debug("SongEditor: emitSheetChanged", value.length, options);

      if (timer.current) {
        clearTimeout(timer.current);
      }

      if (!options.debounce) {
        storeLocalValue(value);
        if (options.updateSongState) {
          updateSongSheet(value);
        }
        return;
      }

      timer.current = setTimeout(() => {
        storeLocalValue(value);
        if (options.updateSongState) {
          updateSongSheet(value);
        }

        timer.current = null;
      }, 3000); // Debounce changes by 3 seconds
    },
    [storeLocalValue, updateSongSheet],
  );

  // Initializes the editor with the current song sheet or new sheet
  // Loads the sheet from localStorage if not provided
  useEffect(() => {
    if (!setEditorValue) {
      return;
    }

    console.debug(
      `SongEditor: useEffect: ${currentSong} ${songState.songSheet?.length} ${songState.newSheet?.length} ${localValue.length}`,
    );

    if (currentSong) {
      if (songState.songSheet && songState.songSheet != localValue) {
        console.debug("SongEditor: useEffect: songSheet");
        setEditorValue(songState.songSheet);
        emitSheetChanged(songState.songSheet, { updateSongState: false, debounce: false });
        return;
      }
    } else {
      if (songState.newSheet && songState.newSheet != localValue) {
        console.debug("SongEditor: useEffect: newSheet");
        setEditorValue(songState.newSheet);
        emitSheetChanged(songState.newSheet, { updateSongState: false, debounce: false });
        return;
      }
    }

    const storedSheet = loadLocalValue();
    if (storedSheet && storedSheet != localValue) {
      console.debug("SongEditor: useEffect: localStorage", storedSheet.length);
      setEditorValue(storedSheet);
      emitSheetChanged(storedSheet, { updateSongState: false, debounce: false });
    }
  }, [setEditorValue, currentSong, loadLocalValue, emitSheetChanged]);

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
    songContext.updateSong({
      id: songState.loadedSong!.id,
      song: {
        sheet: localValue,
      },
    });
  }, [songContext, songState.loadedSong, setSavedSheet, localValue]);

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

        {currentSong && songState.loadedSong?.owner_id == userId && (
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
      </Group>

      <CodeMirror value={localValue} onChange={onEditorChange} theme={okaidia} />
    </>
  );
}

export default SongEditor;
