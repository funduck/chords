import { Anchor, Box, Button, Group, Menu, Text, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSignal } from "@telegram-apps/sdk-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Signals } from "@src/services/signals-registry";

import NewSongForm from "./NewSongForm";
import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const userId = useSignal(Signals.userId);

  const songContext = useSongContext();
  const { songState } = songContext;

  const ref = useRef<HTMLTextAreaElement>(null);

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
    (updateSongState = true) => {
      const value = ref.current!.value;

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
    if (currentSong) {
      if (songState.songSheet) {
        ref.current!.value = songState.songSheet;
        onSheetChanged(false);
        return;
      }
    } else {
      if (songState.newSheet) {
        ref.current!.value = songState.newSheet;
        onSheetChanged(false);
        return;
      }
    }

    const storedSheet = loadSheetValue();
    if (storedSheet) {
      ref.current!.value = storedSheet;
      onSheetChanged();
    }
  }, []);

  // Apply song sheet changes to the editor
  useEffect(() => {
    if (currentSong && songState.songSheet && songState.songSheet !== ref.current!.value) {
      ref.current!.value = songState.songSheet;
      onSheetChanged(false);
    }

    if (!currentSong && songState.newSheet && songState.newSheet !== ref.current!.value) {
      ref.current!.value = songState.newSheet;
      onSheetChanged(false);
    }
  }, [songState.songSheet, songState.newSheet]);

  const saveSheet = useCallback(() => {
    setSavedSheet(ref.current!.value);
    songContext.updateSong({
      id: songState.loadedSong!.id,
      song: {
        sheet: ref.current!.value,
      },
    });
  }, [songContext, songState.loadedSong, ref, setSavedSheet]);

  const formatSheet = useCallback(
    (format: "chordpro" | "chordsoverwords") => {
      const song = ChordProService.sheetToSong(ref.current!.value, {});
      if (!song) {
        notifications.show({
          title: "Error",
          message: "Failed to parse song from sheet",
          color: "red",
          position: "top-right",
        });
        return;
      }
      const formatted = ChordProService.songToSheet(song, { format });
      if (formatted) {
        ref.current!.value = formatted;
        onSheetChanged();
      }
    },
    [songContext, ref, onSheetChanged],
  );

  const clearSheet = useCallback(() => {
    ref.current!.value = "";
    onSheetChanged();
  }, [ref, onSheetChanged]);

  return (
    <>
      <Group mb="md">
        {!currentSong && <NewSongForm sheetValue={ref.current?.value || ""} />}

        {currentSong && songState.loadedSong?.owner_id == userId && (
          <>
            <Button variant="outline" onClick={saveSheet} disabled={savedSheet === ref.current?.value}>
              Save
            </Button>
          </>
        )}
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="outline">Format</Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item onClick={() => formatSheet("chordpro")}>to ChordPro</Menu.Item>
            <Menu.Item onClick={() => formatSheet("chordsoverwords")}>to Chords Over Words</Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button variant="outline" onClick={clearSheet} disabled={"" == ref.current?.value}>
          Clear
        </Button>
      </Group>

      <Textarea
        size="lg"
        ref={ref}
        autosize
        placeholder="Paste song lyrics and chords here."
        onChange={() => onSheetChanged()}
      />

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
