import { Textarea } from "@mantine/core";
import { useEffect, useRef } from "react";

import { useSongContext } from "./SongContext";

function SongEditor({ currentSong }: { currentSong?: boolean }) {
  const { songState, updateSongState } = useSongContext();

  const sheet = currentSong ? songState.sheet : songState.newSheet;

  const ref = useRef<HTMLTextAreaElement>(null);

  function storeSheetValue(value: string) {
    if (value && value.length) {
      if (currentSong) {
        updateSongState({
          sheet: value,
        });
      } else {
        updateSongState({
          newSheet: value,
        });
      }
      localStorage.setItem("editor-sheet", value);
      console.debug("Stored sheet in localStorage", value.length);
    }
  }

  function loadSheetValue(): string {
    const value = localStorage.getItem("editor-sheet");
    if (value && value.length) {
      console.debug("Loaded sheet from localStorage", value.length);
      return value;
    }
    return "";
  }

  // Load the sheet from localStorage if not provided
  useEffect(() => {
    if (sheet && sheet.length) {
      storeSheetValue(sheet);
      ref.current!.value = sheet;
    } else {
      const savedSheet = loadSheetValue();
      if (savedSheet) {
        storeSheetValue(savedSheet);
      }
    }
  }, [sheet]);

  return (
    <>
      <Textarea
        ref={ref}
        autosize
        placeholder="Paste song lyrics and chords here..."
        onChange={(e) => storeSheetValue(e.target.value)}
      />
    </>
  );
}

export default SongEditor;
