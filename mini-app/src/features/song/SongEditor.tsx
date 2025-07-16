import { Textarea } from "@mantine/core";
import { useEffect, useRef } from "react";

import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const { songState, updateSongState } = useSongContext();

  const sheet = currentSong ? songState.songSheet : songState.newSheet;

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

  function onSheetChanged() {
    const value = ref.current!.value;
    if (value && value.length) {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        if (currentSong) {
          updateSongState({
            songSheet: value,
          });
        } else {
          updateSongState({
            newSheet: value,
          });
        }
        timer.current = null;
      }, 1000); // Debounce changes by 1 second
    }
  }

  // Load the sheet from localStorage if not provided
  useEffect(() => {
    if (sheet && sheet.length) {
      storeSheetValue(sheet);
      ref.current!.value = sheet;
    } else {
      const savedSheet = loadSheetValue();
      if (savedSheet) {
        ref.current!.value = savedSheet;
      }
    }
  }, [sheet]);

  return (
    <>
      <Textarea
        size="lg"
        ref={ref}
        autosize
        placeholder="Paste song lyrics and chords here..."
        onChange={onSheetChanged}
      />
    </>
  );
}

export default SongEditor;
