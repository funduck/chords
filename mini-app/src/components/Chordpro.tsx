import { Box } from "@mantine/core";
import * as Parser from "chordproject-parser";
import { ChordProParser, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

function Chordpro({ sheet }: { sheet: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [errText, setErrText] = useState("");

  useEffect(() => {
    if (ref.current) {
      try {
        const parser0 = new Parser.ChordProParser();
        const formater0 = new Parser.ChordProFormatter();
        const parser1 = new ChordProParser();
        const formater1 = new HtmlTableFormatter();
        // chordproject-parser does better parsing while chordsheetjs does better formatting
        const song0 = parser0.parse(sheet);
        const fixedSheet = formater0.format(song0).join("\n");
        const song1 = parser1.parse(fixedSheet);
        const html = formater1.format(song1);
        ref.current.innerHTML = html;
        setErrText(""); // Clear any previous error
      } catch (e) {
        console.error("Error parsing song", e);
        setErrText(String(e));
      }
    }
  }, [ref, sheet]);

  if (errText) {
    return <Box>Error parsing song: {errText}</Box>;
  }

  return <Box className="chordpro" ref={ref} />;
}

export default Chordpro;
