import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

interface ScrollPosition {
  x: number;
  y: number;
}

interface ScrollPositionStorage {
  [key: string]: ScrollPosition;
}

/**
 * Custom hook to save and restore scroll positions for different pages
 */
export function useScrollPosition(ref?: React.RefObject<HTMLDivElement>) {
  const location = useLocation();
  const scrollPositionRef = useRef<ScrollPosition>({ x: 0, y: 0 });

  const saveScrollPosition = (pathname: string, position: ScrollPosition) => {
    try {
      const storage: ScrollPositionStorage = JSON.parse(localStorage.getItem("scroll-positions") || "{}");
      storage[pathname] = position;
      localStorage.setItem("scroll-positions", JSON.stringify(storage));
      console.debug("Saved scroll position for", pathname, position);
    } catch (error) {
      console.error("Failed to save scroll position:", error);
    }
  };

  const getScrollPosition = (pathname: string): ScrollPosition | null => {
    try {
      const storage: ScrollPositionStorage = JSON.parse(localStorage.getItem("scroll-positions") || "{}");
      return storage[pathname] || null;
    } catch (error) {
      console.error("Failed to get scroll position:", error);
      return null;
    }
  };

  const restoreScrollPosition = (pathname: string) => {
    const savedPosition = getScrollPosition(pathname);
    if (savedPosition) {
      console.debug("Restoring scroll position for", pathname, savedPosition);
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        if (ref?.current) {
          ref.current.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: "instant",
          });
        } else {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: "instant",
          });
        }
      }, 50);
    }
  };

  const saveCurrentScrollPosition = () => {
    const currentPosition = ref?.current
      ? {
          x: ref.current.scrollLeft,
          y: ref.current.scrollTop,
        }
      : {
          x: window.scrollX,
          y: window.scrollY,
        };
    scrollPositionRef.current = currentPosition;
    saveScrollPosition(location.pathname, currentPosition);
  };

  // Save scroll position when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentScrollPosition();
    };

    // Save scroll position periodically while scrolling
    const handleScroll = () => {
      const currentPosition = ref?.current
        ? {
            x: ref.current.scrollLeft,
            y: ref.current.scrollTop,
          }
        : {
            x: window.scrollX,
            y: window.scrollY,
          };
      scrollPositionRef.current = currentPosition;

      // Debounce the save operation
      clearTimeout(window.scrollSaveTimeout);
      window.scrollSaveTimeout = setTimeout(() => {
        saveScrollPosition(location.pathname, currentPosition);
      }, 100);
    };

    const scrollElement = ref?.current || window;

    window.addEventListener("beforeunload", handleBeforeUnload);
    scrollElement.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      scrollElement.removeEventListener("scroll", handleScroll);
      clearTimeout(window.scrollSaveTimeout);
    };
  }, [location.pathname, ref]);

  // Restore scroll position when entering a page
  useEffect(() => {
    restoreScrollPosition(location.pathname);
  }, [location.pathname, ref]);

  return {
    saveScrollPosition: saveCurrentScrollPosition,
    restoreScrollPosition: () => restoreScrollPosition(location.pathname),
    getScrollPosition: () => getScrollPosition(location.pathname),
  };
}

// Extend Window interface to include our timeout
declare global {
  interface Window {
    scrollSaveTimeout: number;
  }
}
