import { useSignal } from "@telegram-apps/sdk-react";
import { useEffect, useRef } from "react";

import { Config } from "@src/config";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { Signals } from "@src/services/signals-registry";
import { estimateFontSize } from "@src/utils/font";

import { useSongContext } from "./SongContext";

type OnScrollPositionChange = (position: { x: number; y: number }) => void;

function AutoScrollManager({
  viewportRef,
  onScrollPositionChangeInit,
}: {
  viewportRef: React.RefObject<HTMLDivElement>;
  onScrollPositionChangeInit: (fn: OnScrollPositionChange) => void;
}) {
  const room = useSignal(Signals.room);

  const { songState, applyChanges } = useSongContext();

  const enabled = songState?.autoScrollOptions?.enabled ?? Config.AutoScrollEnabled;
  const speed = songState?.autoScrollOptions?.speed ?? Config.AutoScrollSpeed;
  const interval = songState?.autoScrollOptions?.interval ?? Config.AutoScrollInterval;

  const applySongScroll = applyChanges?.applySongScroll;
  const applySongSettings = applyChanges?.applySongSettings;

  // Initialize scroll position management
  const { saveScrollPosition } = useScrollPosition(viewportRef);

  // This flag prevents emitting scroll events we are applying scroll events from room
  const emitScrollEvent = useRef(true);

  // This is used to debounce the scroll events when user scrolls manually
  const emittingScrollTimeout = useRef(null as ReturnType<typeof setTimeout> | null);

  // HANDLE SYNC SCROLLING IN ROOM
  // Auto scrolling
  useEffect(() => {
    if (viewportRef.current && enabled && interval && speed) {
      // Get font size in pixels
      const { height } = estimateFontSize({});

      let scrollSpeed = Math.max(1, speed); // 1-100
      // Convert scroll speed from percentage to pixels
      scrollSpeed = Math.ceil((scrollSpeed * height) / 10);

      console.debug("Auto-scrolling is enabled", [interval, speed], "starting interval", { interval, scrollSpeed });
      const _interval = setInterval(() => {
        if (!viewportRef.current) {
          console.debug("Auto-scrolling: songViewportRef is null");
          return;
        }

        // Prevent emitting scroll events while auto-scrolling
        emitScrollEvent.current = false;
        viewportRef.current.onscrollend = () => {
          setTimeout(() => {
            emitScrollEvent.current = true;
          }, 10);
        };

        viewportRef.current.scrollBy({
          top: scrollSpeed,
          behavior: "smooth",
        });
      }, interval);
      return () => {
        console.debug("Auto-scrolling interval cleared");
        clearInterval(_interval);
      };
    }
  }, [room, viewportRef.current, enabled, interval, speed]);
  // Emitting scroll events
  function onScrollPositionChange() {
    saveScrollPosition();

    if (!room) {
      return;
    }
    if (!viewportRef.current) {
      console.error("Song container not found");
      return;
    }
    if (!emitScrollEvent.current) {
      return;
    }
    const scrollPercent =
      (viewportRef.current!.scrollTop / (viewportRef.current!.scrollHeight - viewportRef.current!.clientHeight)) * 100;

    // Debounce scroll events to avoid flooding the signal
    if (emittingScrollTimeout.current) {
      clearTimeout(emittingScrollTimeout.current);
      emittingScrollTimeout.current = null;
    }
    emittingScrollTimeout.current = setTimeout(() => {
      Signals.publishSongScroll.set(scrollPercent);
      console.debug("Scroll event emitted:", scrollPercent);
    }, 50);
  }
  onScrollPositionChangeInit(onScrollPositionChange);
  // Applying scroll events
  useEffect(() => {
    if (!room) {
      return;
    }
    if (applySongScroll == null) {
      return;
    }
    if (!viewportRef.current) {
      console.debug("Apply scroll: song container not found");
      return;
    }

    console.debug("Applying scroll:", applySongScroll);

    // applySongScroll is a percentage (0-100)
    const scrollTop = (applySongScroll / 100) * (viewportRef.current.scrollHeight - viewportRef.current.clientHeight);

    // Prevent emitting scroll events while applying scroll
    emitScrollEvent.current = false;
    viewportRef.current.onscrollend = () => {
      emitScrollEvent.current = true;
    };

    viewportRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });

    Signals.applySongScroll.set(null); // Clear the signal after applying
  }, [room, viewportRef.current, applySongScroll, applySongSettings?.auto_scroll]);

  return <></>;
}

export default AutoScrollManager;
