import { Box, Divider, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { HtmlDivFormatter, HtmlTableFormatter } from "chordsheetjs";
import { useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { estimateFontSize } from "@src/utils/font";

function ChordProViewer({ sheet, transpose, active }: { sheet: string; transpose?: number; active?: boolean }) {
  console.debug("Rendering ChordProViewer", { active });
  const ref = useRef<HTMLDivElement>(null);
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
    if (!ref.current || !active) {
      return;
    }
    try {
      const font = estimateFontSize({ parent: ref.current, className: "lyrics" }); // Estimate font size for lyrics

      // We track screen changes via "width" but we need to use ref.current.offsetWidth to get the actual width of the container
      const maxLineLength = Math.floor((ref.current.offsetWidth || width) / font.width);

      let song = ChordProService.sheetToSong(sheet, {
        maxLineLength,
      });
      if (!song) {
        throw new Error("Failed to parse song from sheet");
      }
      if (transpose) {
        song = ChordProService.transposeSong(song, transpose);
      }

      setTitle(song.title || "");
      setArtists(song.artist);
      setComposers(song.composer);

      // const formater = new HtmlDivFormatter();
      const formater = new HtmlTableFormatter();
      const html = formater.format(song);

      ref.current.innerHTML = html;
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to parse ChordPro sheet in viewer. " + (e as Error).message,
        color: "red",
        position: "top-right",
      });
    }
  }, [ref, sheet, width, transpose, active]);

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
