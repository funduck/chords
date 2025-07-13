import { Textarea } from "@mantine/core";
import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef } from "react";

import { Signals } from "@src/services/signals-registry";

function SongEditor() {
  const sheet = useSignal(Signals.sheet);

  const ref = useRef<HTMLTextAreaElement>(null);

  function storeSheetValue(value: string) {
    if (value && value.length) {
      Signals.sheet.set(value);
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
        ref.current!.value = savedSheet;
      }
    }
  }, []);

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
