import { Box } from "@mantine/core";
import * as Parser from "chordproject-parser";
import { ChordProParser, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

import { EstimateFontSize } from "@src/utils/font";

function Chordpro({ sheet }: { sheet: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [errText, setErrText] = useState("");
  const [width, setWidth] = useState(window.innerWidth);

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
      const font = EstimateFontSize({ parent: ref.current, className: "lyrics" }); // Estimate font size for lyrics

      // We track screen changes via "width" but we need to use ref.current.offsetWidth to get the actual width of the container
      const maxLineLength = Math.floor((ref.current.offsetWidth || width) / font.width);

      const parser0 = new Parser.ChordProParser();
      const formater0 = new Parser.ChordProFormatter();
      const parser1 = new ChordProParser();
      const formater1 = new HtmlTableFormatter();
      // chordproject-parser does better parsing while chordsheetjs does better formatting

      const song0 = parser0.parse(sheet);
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
      const song1 = parser1.parse(fixedSheet);
      const html = formater1.format(song1);
      ref.current.innerHTML = html;
      setErrText(""); // Clear any previous error
    } catch (e) {
      console.error("Error parsing song", e);
      setErrText(String(e));
    }
  }, [ref, sheet, width]);

  if (errText) {
    return <Box>Error parsing song: {errText}</Box>;
  }

  return <Box className="chordpro" ref={ref} />;
}

export default Chordpro;
