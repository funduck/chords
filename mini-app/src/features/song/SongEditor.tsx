import { Anchor, Box, Button, Group, Text, Textarea } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Signals } from "@src/services/signals-registry";

import NewSongForm from "./NewSongForm";
import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const userId = useSignal(Signals.userId);

  const { songState, updateSongState, updateSong } = useSongContext();

  const ref = useRef<HTMLTextAreaElement>(null);

  const timer = useRef(null as ReturnType<typeof setTimeout> | null);

  function storeSheetValue(value: string) {
    localStorage.setItem("editor-sheet", value);
    console.debug("Stored sheet in localStorage", value.length);
  }

  function loadSheetValue(): string {
    const value = localStorage.getItem("editor-sheet");
    if (value && value.length) {
      console.debug("Loaded sheet from localStorage", value.length);
      return value;
    }
    return "";
  }

  function updateSongSheet(value: string) {
    if (currentSong) {
      updateSongState({
        songSheet: value,
      });
    } else {
      updateSongState({
        newSheet: value,
      });
    }
  }

  function onSheetChanged() {
    const value = ref.current!.value;

    if (value && value.length) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        storeSheetValue(value);
        updateSongSheet(value);

        timer.current = null;
      }, 1000); // Debounce changes by 1 second
    }
  }

  const [savedSheet, setSavedSheet] = useState("");
  const [formattedSheet, setFormattedSheet] = useState("");

  // Load the sheet from localStorage if not provided
  useEffect(() => {
    if (currentSong) {
      if (songState.songSheet) {
        ref.current!.value = songState.songSheet;
        setSavedSheet(songState.songSheet);
        return;
      }
    } else {
      if (songState.newSheet) {
        ref.current!.value = songState.newSheet;
        setSavedSheet(songState.newSheet);
        return;
      }
    }

    const storedSheet = loadSheetValue();
    if (storedSheet) {
      ref.current!.value = storedSheet;
      setSavedSheet(storedSheet);
    }
  }, []);

  function saveSheet() {
    setSavedSheet(ref.current!.value);
    updateSong({
      id: songState.loadedSong!.id,
      song: {
        sheet: ref.current!.value,
      },
    });
  }

  function formatSheet() {
    const formatted = ChordProService.parseToChordproSheet(ref.current!.value, {});
    ref.current!.value = formatted;
    setFormattedSheet(formatted);
  }

  return (
    <>
      <Box mb="md">
        <Text>
          Song will be displayed using{" "}
          <Anchor href="https://www.chordpro.org/chordpro/chordpro-introduction/">chordpro</Anchor> format.
        </Text>
      </Box>

      <Group mb="md">
        {!currentSong && <NewSongForm sheetValue={ref.current?.value || ""} />}
        {currentSong && songState.loadedSong?.owner_id == userId && (
          <>
            <Button variant="outline" onClick={saveSheet} disabled={savedSheet === ref.current?.value}>
              Save
            </Button>
          </>
        )}
        <Button variant="outline" onClick={formatSheet} disabled={formattedSheet == ref.current?.value}>
          Format
        </Button>
      </Group>

      <Textarea
        size="lg"
        ref={ref}
        autosize
        placeholder="Paste song lyrics and chords here, it will be automatically formatted."
        onChange={onSheetChanged}
      />
    </>
  );
}

export default SongEditor;
