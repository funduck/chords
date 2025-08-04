import { Box, Divider, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { HtmlDivFormatter } from "chordsheetjs";
import { memo, useEffect, useRef, useState } from "react";

import { ChordProService } from "@src/services/chordpro/chordpro";
import { Logger } from "@src/services/logger.service";
import { estimateFontSize } from "@src/utils/font";

function ChordProViewer({
  sheet,
  transpose,
  fontSize,
  active,
}: {
  sheet: string;
  transpose?: number;
  fontSize?: number;
  active?: boolean;
}) {
  console.debug("Rendering ChordProViewer", { active });
  const ref = useRef<HTMLDivElement>(null);
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
    if (!ref.current || !active) {
      return;
    }
    try {
      const font = estimateFontSize({ parent: ref.current, className: "lyrics" }); // Estimate font size for lyrics

      // We track screen changes via "width" but we need to use ref.current.offsetWidth to get the actual width of the container
      const maxLineLength = Math.floor((ref.current.offsetWidth || width) / font.width);

      let song = ChordProService.sheetToSong(sheet, {
        maxLineLength,
        throw: true,
      });
      if (!song) {
        throw new Error("Failed to parse song from sheet");
      }
      if (transpose) {
        song = ChordProService.transposeSong(song, transpose);
      }

      const formater = new HtmlDivFormatter();
      const html = formater.format(song);

      ref.current.innerHTML = html;

      // Apply fontSize to the rendered content
      if (ref.current) {
        ref.current.style.fontSize = `${fontSize}px`;
      }
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to parse ChordPro sheet in viewer. " + (e as Error).message,
        color: "red",
        position: "top-right",
      });
      Logger.error("Failed to render ChordPro sheet:", (e as Error).message);
    }
  }, [ref, sheet, width, transpose, active, fontSize]);

  return (
    <>
      <Box className="chordpro" ref={ref} />
      <Divider my="md" />
      <Text style={{ fontStyle: "italic" }}>End</Text>
    </>
  );
}

// Memoize the component to prevent re-renders when only scroll position changes
export default memo(ChordProViewer, (prevProps, nextProps) => {
  // Only re-render if the props that actually affect the content change
  return (
    prevProps.sheet === nextProps.sheet &&
    prevProps.transpose === nextProps.transpose &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.active === nextProps.active
  );
});
