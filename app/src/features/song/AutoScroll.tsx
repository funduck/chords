import { useEffect, useRef, useState } from "react";

import { Config } from "@src/config";
import { useScrollPosition } from "@src/hooks/useScrollPosition";
import { estimateFontSize } from "@src/utils/font";

import { useSongContext } from "./SongContext";

function AutoScrollManager({ viewportRef }: { viewportRef: React.RefObject<HTMLDivElement> }) {
  const { applyScrollPosition, autoScrollOptions, updateAutoScrollOptions, setScrollPosition } = useSongContext();

  const enabled = autoScrollOptions?.enabled ?? Config.AutoScrollEnabled;
  const speed = autoScrollOptions?.speed ?? Config.AutoScrollSpeed;
  const interval = autoScrollOptions?.interval ?? Config.AutoScrollInterval;

  // Initialize scroll position management
  useScrollPosition(viewportRef);

  // This flag prevents emitting scroll events we are applying scroll events from room
  const allowScrollEvent = useRef(true);

  // This is used to debounce the scroll events when user scrolls manually
  const emittingScrollTimeout = useRef(null as ReturnType<typeof setTimeout> | null);

  // Track touch state to temporarily disable auto-scroll on mobile
  const [isTouching, setIsTouching] = useState(false);

  // Keyboard event listener for Space key to toggle auto-scroll and arrow keys for manual scrolling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if any input field is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          (activeElement as HTMLElement).contentEditable === "true" ||
          activeElement.classList.contains("cm-editor")); // CodeMirror editor

      if (isInputFocused) {
        return; // Don't interfere with input controls
      }

      // Check if Space key is pressed
      if (event.code === "Space" || event.key === " ") {
        event.preventDefault(); // Prevent default space behavior (page scroll)

        // Toggle auto-scroll
        updateAutoScrollOptions({
          enabled: !enabled,
        });

        console.debug("Auto-scroll toggled via Space key:", !enabled);
      }

      const isUpPressed = event.code === "ArrowUp" || event.key === "ArrowUp";
      const isDownPressed = event.code === "ArrowDown" || event.key === "ArrowDown";

      if (viewportRef.current && (isUpPressed || isDownPressed)) {
        // Handle arrow keys for manual scrolling by 20% of the viewport height

        // Calculate 20% of the viewport height and scroll up
        const scrollAmount = viewportRef.current.clientHeight * 0.2;

        // Prevent emitting scroll events during manual navigation
        allowScrollEvent.current = false;

        viewportRef.current.scrollBy({
          top: isUpPressed ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }

      const ifLeftPressed = event.code === "ArrowLeft" || event.key === "ArrowLeft";
      const ifRightPressed = event.code === "ArrowRight" || event.key === "ArrowRight";

      if (viewportRef.current && enabled && (ifLeftPressed || ifRightPressed)) {
        // Handle left/right arrow keys for speed down/up when auto-scroll is enabled
        event.preventDefault();

        updateAutoScrollOptions({
          speed: Math.min(100, Math.max(1, speed + (ifRightPressed ? 10 : -10))),
        });
      }
    };

    // Add global keyboard event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, updateAutoScrollOptions, viewportRef]);

  // Auto scrolling
  useEffect(() => {
    if (viewportRef.current && enabled && interval && speed && !isTouching) {
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
        allowScrollEvent.current = false;

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
  }, [viewportRef, enabled, interval, speed, isTouching]);

  // Emitting scroll events
  function onScrollPositionChange() {
    if (!viewportRef.current) {
      console.error("Song container not found");
      return;
    }
    if (!allowScrollEvent.current) {
      return;
    }

    // Debounce scroll events to avoid flooding the signal
    if (emittingScrollTimeout.current) {
      return;
    }

    emittingScrollTimeout.current = setTimeout(() => {
      const scrollPercent =
        (viewportRef.current!.scrollTop / (viewportRef.current!.scrollHeight - viewportRef.current!.clientHeight)) *
        100;
      setScrollPosition(scrollPercent);
      console.debug("Scroll event emitted:", scrollPercent);
      emittingScrollTimeout.current = null;
    }, 50); // Debounce time in milliseconds
  }

  // Attach scroll event listener
  useEffect(() => {
    if (!viewportRef.current) {
      console.debug("Song container not found, skipping scroll event listener");
      return;
    }
    let timer: any;
    viewportRef.current.onscroll = onScrollPositionChange;
    viewportRef.current.onscrollend = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        allowScrollEvent.current = true;
      }, 10); // Adding a small delay to allow scroll event to be processed
    };
    return () => {
      if (viewportRef.current) {
        viewportRef.current.onscroll = null;
        viewportRef.current.onscrollend = null;
      }
    };
  }, [viewportRef]);

  // Touch event listeners to disable auto-scroll during touch
  useEffect(() => {
    if (!viewportRef.current) {
      console.debug("Song container not found, skipping touch event listeners");
      return;
    }

    const handleTouchStart = () => {
      console.debug("Touch start detected - disabling auto-scroll");
      setIsTouching(true);
    };

    const handleTouchEnd = () => {
      console.debug("Touch end detected - enabling auto-scroll");
      setIsTouching(false);
    };

    const handleTouchCancel = () => {
      console.debug("Touch cancel detected - enabling auto-scroll");
      setIsTouching(false);
    };

    const element = viewportRef.current;
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });
    element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [viewportRef]);

  // Applying scroll events
  useEffect(() => {
    if (!viewportRef.current) {
      console.debug("Apply scroll: song container not found");
      return;
    }
    if (applyScrollPosition == null) {
      return;
    }

    // songState.applyScrollPosition is a percentage (0-100)
    const scrollTop =
      (applyScrollPosition / 100) * (viewportRef.current.scrollHeight - viewportRef.current.clientHeight);

    // Prevent emitting scroll events while applying scroll
    allowScrollEvent.current = false;

    viewportRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
  }, [applyScrollPosition, viewportRef]);

  return <></>;
}

export default AutoScrollManager;
