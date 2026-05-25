import { useCallback, useEffect, useState } from "react";
import { Dimensions, StatusBar } from "react-native";
import Orientation from "react-native-orientation-locker";
import type { PlayerLayoutMode } from "../types/player.types";

export const usePlayerOrientation = (
  onFullscreenChange?: (isFullscreen: boolean) => void,
) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<PlayerLayoutMode>("portrait");

  const applyFullscreen = useCallback(
    (next: boolean) => {
      setIsFullscreen(next);
      setLayoutMode(next ? "landscape" : "portrait");
      try {
        if (next) {
          Orientation.lockToLandscape();
        } else {
          Orientation.lockToPortrait();
        }
      } catch (e) {
        console.warn("Orientation lock failed:", e);
      }
      StatusBar.setHidden(next);
      onFullscreenChange?.(next);
    },
    [onFullscreenChange],
  );

  const toggleFullscreen = useCallback(() => {
    applyFullscreen(!isFullscreen);
  }, [applyFullscreen, isFullscreen]);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      const landscape = window.width > window.height;
      setLayoutMode(landscape ? "landscape" : "portrait");
      if (landscape !== isFullscreen) {
        setIsFullscreen(landscape);
        StatusBar.setHidden(landscape);
      }
    });
    return () => sub.remove();
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      try {
        Orientation.lockToPortrait();
      } catch {
        /* noop */
      }
      StatusBar.setHidden(false);
    };
  }, []);

  return {
    isFullscreen,
    layoutMode,
    isLandscape: layoutMode === "landscape",
    toggleFullscreen,
    applyFullscreen,
    exitFullscreen: () => applyFullscreen(false),
  };
};
