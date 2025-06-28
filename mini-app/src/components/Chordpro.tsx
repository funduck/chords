import { Box } from "@mantine/core";
import * as Parser from "chordproject-parser";
import { ChordProParser, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

function Chordpro({ sheet }: { sheet: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [errText, setErrText] = useState("");
  const [orientation, setOrientation] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth);
    };

    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      try {
        // Define max length for a line from viewport width
        const maxLineLength = Math.floor((window.innerWidth * 0.8) / 7); // Assuming average character width of 10px

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
    }
  }, [ref, sheet, orientation]);

  if (errText) {
    return <Box>Error parsing song: {errText}</Box>;
  }

  return <Box className="chordpro" ref={ref} />;
}

export default Chordpro;
