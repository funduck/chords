import { Anchor, Box, Button, Group, Menu, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSignal } from "@telegram-apps/sdk-react";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Signals } from "@src/services/signals-registry";

import NewSongForm from "./NewSongForm";
import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const userId = useSignal(Signals.userId);

  const songContext = useSongContext();
  const { songState } = songContext;

  // const ref = useRef<HTMLTextAreaElement>(null);
  const ref = useRef<ReactCodeMirrorRef>(null);
  const [value, setValue] = useState("");
  const getEditorValue = useCallback(() => {
    return value;
  }, [value]);
  const setEditorValue = useCallback(
    (value: string) => {
      console.debug("Setting editor value", value.length);
      if (ref.current?.view) {
        ref.current.view.dispatch({
          changes: { from: 0, to: ref.current.view.state.doc.length, insert: value },
        });
      } else console.warn("CodeMirror ref is not ready yet, cannot set value");
    },
    [ref],
  );

  const timer = useRef(null as ReturnType<typeof setTimeout> | null);

  const storeSheetValue = useCallback((value: string) => {
    localStorage.setItem("editor-sheet", value);
  }, []);

  const loadSheetValue = useCallback(() => {
    const value = localStorage.getItem("editor-sheet");
    if (value && value.length) {
      console.debug("Loaded sheet from localStorage", value.length);
      return value;
    }
    return "";
  }, []);

  const updateSongSheet = useCallback(
    (value: string) => {
      console.debug("Updating song sheet", value.length);
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

  const onSheetChanged = useCallback(
    (value: string, updateSongState = true) => {
      console.debug("SongEditor: onSheetChanged", value.length);

      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        storeSheetValue(value);
        if (updateSongState) {
          updateSongSheet(value);
        }

        timer.current = null;
      }, 3000); // Debounce changes by 3 seconds
    },
    [storeSheetValue, updateSongSheet],
  );

  const [savedSheet, setSavedSheet] = useState("");

  // Load the sheet from localStorage if not provided
  useEffect(() => {
    if (!setEditorValue || !ref.current?.view) {
      return;
    }

    console.debug("SongEditor: useEffect: setEditorValue is ready");

    if (currentSong) {
      if (songState.songSheet) {
        setEditorValue(songState.songSheet);
        onSheetChanged(songState.songSheet, false);
        return;
      }
    } else {
      if (songState.newSheet) {
        setEditorValue(songState.newSheet);
        onSheetChanged(songState.newSheet, false);
        return;
      }
    }

    const storedSheet = loadSheetValue();
    if (storedSheet) {
      setEditorValue(storedSheet);
      onSheetChanged(storedSheet);
    }
  }, [ref.current?.view, setEditorValue]);

  // Apply song sheet changes to the editor
  useEffect(() => {
    if (!setEditorValue || !ref.current?.view) {
      return;
    }
    const value = getEditorValue();
    if (currentSong && songState.songSheet && songState.songSheet !== value) {
      setSavedSheet(songState.songSheet);
      onSheetChanged(songState.songSheet, false);
    }

    if (!currentSong && songState.newSheet && songState.newSheet !== value) {
      setEditorValue(songState.newSheet);
      onSheetChanged(songState.newSheet, false);
    }
  }, [ref.current?.view, setEditorValue, songState.songSheet, songState.newSheet]);

  const saveSheet = useCallback(() => {
    const value = getEditorValue();
    setSavedSheet(value);
    songContext.updateSong({
      id: songState.loadedSong!.id,
      song: {
        sheet: value,
      },
    });
  }, [songContext, songState.loadedSong, setSavedSheet, getEditorValue]);

  const formatSheet = useCallback(
    (format: "chordpro" | "chordsoverwords") => {
      const song = ChordProService.sheetToSong(getEditorValue(), {});
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
      onSheetChanged(formatted);
      notifications.show({
        title: "Success",
        message: `Song formatted to ${format}`,
        color: "green",
        position: "top-right",
      });
    },
    [ref.current?.view, setEditorValue, songContext, onSheetChanged, getEditorValue],
  );

  const clearSheet = useCallback(() => {
    setEditorValue("");
    onSheetChanged("");
  }, [ref.current?.view, setEditorValue, onSheetChanged]);

  const onEditorChange = useCallback(
    (value) => {
      setValue(value);
      onSheetChanged(value, true);
    },
    [onSheetChanged],
  );

  return (
    <>
      <Group mb="md">
        {!currentSong && <NewSongForm sheetValue={getEditorValue() || ""} />}

        {currentSong && songState.loadedSong?.owner_id == userId && (
          <>
            <Button variant="outline" onClick={saveSheet} disabled={savedSheet === getEditorValue()}>
              Save
            </Button>
          </>
        )}

        <Button variant="outline" onClick={() => formatSheet("chordpro")}>
          Format
        </Button>

        <Button variant="outline" onClick={clearSheet} disabled={"" == getEditorValue()}>
          Clear
        </Button>
      </Group>

      <CodeMirror ref={ref} onChange={onEditorChange} theme={okaidia} />

      <Box mt="md">
        <Text>
          For songs we use <Anchor href="https://www.chordpro.org/chordpro/chordpro-introduction/">chordpro</Anchor>{" "}
          format.
        </Text>
      </Box>
    </>
  );
}

export default SongEditor;
