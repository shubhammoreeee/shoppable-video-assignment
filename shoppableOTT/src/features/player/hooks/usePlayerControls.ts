import { useCallback, useEffect, useRef } from "react";
import {
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { AUTO_HIDE_CONTROLS_MS, CONTROLS_FADE_MS } from "../components/VideoPlayer/constants";

type Options = {
  paused: boolean;
  isSeeking: boolean;
  settingsOpen: boolean;
  xraySheetOpen: boolean;
};

export const usePlayerControls = ({
  paused,
  isSeeking,
  settingsOpen,
  xraySheetOpen,
}: Options) => {
  const controlsOpacity = useSharedValue(1);
  const controlsVisible = useSharedValue(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {
    clearHideTimer();
    if (paused || isSeeking || settingsOpen || xraySheetOpen) {
      return;
    }
    hideTimer.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: CONTROLS_FADE_MS });
      controlsVisible.value = withTiming(0, { duration: CONTROLS_FADE_MS });
    }, AUTO_HIDE_CONTROLS_MS);
  }, [
    clearHideTimer,
    paused,
    isSeeking,
    settingsOpen,
    xraySheetOpen,
    controlsOpacity,
    controlsVisible,
  ]);

  const showControls = useCallback(() => {
    clearHideTimer();
    controlsOpacity.value = withTiming(1, { duration: CONTROLS_FADE_MS });
    controlsVisible.value = withTiming(1, { duration: CONTROLS_FADE_MS });
    scheduleAutoHide();
  }, [clearHideTimer, controlsOpacity, controlsVisible, scheduleAutoHide]);

  const hideControls = useCallback(() => {
    clearHideTimer();
    controlsOpacity.value = withTiming(0, { duration: CONTROLS_FADE_MS });
    controlsVisible.value = withTiming(0, { duration: CONTROLS_FADE_MS });
  }, [clearHideTimer, controlsOpacity, controlsVisible]);

  const toggleControls = useCallback(
    (onHidden?: () => void) => {
      if (controlsVisible.value > 0.5) {
        hideControls();
        if (onHidden) {
          runOnJS(onHidden)();
        }
      } else {
        showControls();
      }
    },
    [controlsVisible, hideControls, showControls],
  );

  useEffect(() => {
    showControls();
    return clearHideTimer;
  }, [paused, showControls, clearHideTimer]);

  useEffect(() => {
    if (!settingsOpen && !xraySheetOpen && !isSeeking) {
      scheduleAutoHide();
    } else {
      clearHideTimer();
      showControls();
    }
  }, [
    settingsOpen,
    xraySheetOpen,
    isSeeking,
    scheduleAutoHide,
    clearHideTimer,
    showControls,
  ]);

  return {
    controlsOpacity,
    controlsVisible,
    showControls,
    hideControls,
    toggleControls,
    scheduleAutoHide,
    clearHideTimer,
  };
};
