import { Box, Divider, Text, Title } from "@mantine/core";
import * as Parser from "chordproject-parser";
import { Chord, ChordProParser, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { estimateFontSize } from "@src/utils/font";

function ChordProViewer({ sheet, transpose }: { sheet: string; transpose?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [errText, setErrText] = useState("");
  const [width, setWidth] = useState(window.innerWidth);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [composer, setComposer] = useState("");

  function setArtists(artist: string | string[] | null) {
    if (Array.isArray(artist)) {
      setArtist(artist.join(", "));
    } else if (typeof artist === "string") {
      setArtist(artist);
    } else {
      setArtist("");
    }
  }
  function setComposers(composer: string | string[] | null) {
    if (Array.isArray(composer)) {
      setComposer(composer.join(", "));
    } else if (typeof composer === "string") {
      setComposer(composer);
    } else {
      setComposer("");
    }
  }

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
      const font = estimateFontSize({ parent: ref.current, className: "lyrics" }); // Estimate font size for lyrics

      // We track screen changes via "width" but we need to use ref.current.offsetWidth to get the actual width of the container
      const maxLineLength = Math.floor((ref.current.offsetWidth || width) / font.width);

      let song = ChordProService.sheetToSong(sheet, {
        maxLineLength,
      });
      if (transpose) {
        song = ChordProService.transposeSong(song, transpose);
      }

      setTitle(song.title || "");
      setArtists(song.artist);
      setComposers(song.composer);

      const formater = new HtmlTableFormatter();
      const html = formater.format(song);

      ref.current.innerHTML = html;
      setErrText(""); // Clear any previous error
    } catch (e) {
      console.error("Error parsing song", e);
      setErrText(String(e));
    }
  }, [ref, sheet, width, transpose]);

  return (
    <>
      {errText && <Box>Error parsing song: {errText}</Box>}
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
