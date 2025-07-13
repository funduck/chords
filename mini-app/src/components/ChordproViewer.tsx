import { Box, Divider, Text, Title } from "@mantine/core";
import * as Parser from "chordproject-parser";
import { Chord, ChordProParser, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

import { estimateFontSize } from "@src/utils/font";

function ChordProViewer({ sheet, raw, transpose }: { sheet: string; raw?: boolean; transpose?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [errText, setErrText] = useState("");
  const [width, setWidth] = useState(window.innerWidth);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [composer, setComposer] = useState("");

  useEffect(() => {
    const handleWidthChange = () => {
      console.debug("Window width changed:", window.innerWidth);
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleWidthChange);

    return () => {
      window.removeEventListener("resize", handleWidthChange);
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    try {
      if (raw) {
        ref.current.innerHTML = `<pre>${sheet}</pre>`;
        return; // If raw is true, we just display the raw sheet
      }

      const font = estimateFontSize({ parent: ref.current, className: "lyrics" }); // Estimate font size for lyrics

      // We track screen changes via "width" but we need to use ref.current.offsetWidth to get the actual width of the container
      const maxLineLength = Math.floor((ref.current.offsetWidth || width) / font.width);

      const parser0 = new Parser.ChordProParser();
      const formater0 = new Parser.ChordProFormatter();
      const parser1 = new ChordProParser();
      const formater1 = new HtmlTableFormatter();
      // chordproject-parser does better parsing while chordsheetjs does better formatting

      const song0 = parser0.parse(sheet);
      setTitle(song0.title || "");
      setArtist([...song0.artists].join(", ") || "");
      setComposer([...song0.composers].join(", ") || "");

      const sheetLines = formater0.format(song0);
      const fixedSheetLines: string[] = [];
      for (const line of sheetLines) {
        if (!line.startsWith("{") && line.length > maxLineLength) {
          const rest = line.split(" ").reduce((acc, word) => {
            if (acc.length + word.length + 1 > maxLineLength) {
              fixedSheetLines.push(acc);
              return word; // Start new line with the current word
            }
            return acc ? `${acc} ${word}` : word; // Add space if acc is not empty
          }, "");
          if (rest) {
            fixedSheetLines.push(rest); // Add the last part if it exists
          }
        } else {
          fixedSheetLines.push(line);
        }
      }
      const fixedSheet = fixedSheetLines.join("\n");
      let song1 = parser1.parse(fixedSheet);
      if (transpose != null && transpose != 0) {
        console.debug("Transposing song by", transpose, "semitones");
        let key = song1.key;
        if (!key) {
          key =
            song1
              .getChords()
              .map((c) => Chord.parseOrFail(c).root?.note)
              .find(Boolean) || "C"; // Default to C if no chords found
          song1 = song1.setKey(key);
          console.debug("No key found, using key:", key);
        }
        const newKey = song1.requireCurrentKey().transpose(transpose);
        song1 = song1.changeKey(newKey);
      }
      const html = formater1.format(song1);
      ref.current.innerHTML = html;
      setErrText(""); // Clear any previous error
    } catch (e) {
      console.error("Error parsing song", e);
      setErrText(String(e));
    }
  }, [ref, sheet, width, raw, transpose]);

  if (errText) {
    return <Box>Error parsing song: {errText}</Box>;
  }

  return (
    <>
      <Title>{title}</Title>
      <Text size="xl">Artist: {artist}</Text>
      <Text size="xl">Composer: {composer}</Text>
      <Divider my="md" />
      <Box className="chordpro" ref={ref} />
      <Divider my="md" />
      <Text style={{ fontStyle: "italic" }}>End</Text>
    </>
  );
}

export default ChordProViewer;
