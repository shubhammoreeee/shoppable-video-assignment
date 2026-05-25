import React, { memo, useRef, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { IconSkip } from "./PlayerIcons";
import { DOUBLE_TAP_DELAY_MS, SEEK_SKIP_SECONDS } from "./constants";

type Props = {
  width: number;
  onSingleTap: () => void;
  onDoubleTapLeft: () => void;
  onDoubleTapRight: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
  onSwipeUpdate?: (side: "left" | "right", delta: number) => void;
  onSwipeEnd?: (side: "left" | "right") => void;
  children?: React.ReactNode;
};

const GestureLayer = memo(
  ({
    width,
    onSingleTap,
    onDoubleTapLeft,
    onDoubleTapRight,
    onLongPressStart,
    onLongPressEnd,
    onSwipeUpdate,
    onSwipeEnd,
    children,
  }: Props) => {
    const lastTapTime = useRef(0);
    const lastTapX = useRef(0);
    const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const leftOpacity = useSharedValue(0);
    const rightOpacity = useSharedValue(0);
    const swipeStartY = useSharedValue(0);

    const flashSeek = (side: "left" | "right") => {
      const sv = side === "left" ? leftOpacity : rightOpacity;
      sv.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 400 }),
      );
    };

    const handleDoubleTap = useCallback(
      (x: number) => {
        if (x < width / 2) {
          flashSeek("left");
          onDoubleTapLeft();
        } else {
          flashSeek("right");
          onDoubleTapRight();
        }
      },
      [width, onDoubleTapLeft, onDoubleTapRight],
    );

    const handleTapJS = useCallback(
      (x: number) => {
        const now = Date.now();
        if (
          now - lastTapTime.current < DOUBLE_TAP_DELAY_MS &&
          Math.abs(x - lastTapX.current) < 60
        ) {
          if (singleTapTimer.current) {
            clearTimeout(singleTapTimer.current);
            singleTapTimer.current = null;
          }
          lastTapTime.current = 0;
          handleDoubleTap(x);
          return;
        }
        lastTapTime.current = now;
        lastTapX.current = x;
        singleTapTimer.current = setTimeout(() => {
          onSingleTap();
          singleTapTimer.current = null;
        }, DOUBLE_TAP_DELAY_MS);
      },
      [handleDoubleTap, onSingleTap],
    );

    const tap = Gesture.Tap().onEnd((e) => {
      runOnJS(handleTapJS)(e.x);
    });

    const longPress = Gesture.LongPress()
      .minDuration(400)
      .onStart(() => {
        if (onLongPressStart) runOnJS(onLongPressStart)();
      })
      .onEnd(() => {
        if (onLongPressEnd) runOnJS(onLongPressEnd)();
      });

    // Vertical Pan Gesture for volume/brightness
    const swipeSide = useSharedValue<"left" | "right">("left");
    const verticalPan = Gesture.Pan()
      .onBegin((e) => {
        swipeStartY.value = e.y;
        swipeSide.value = e.x < width / 2 ? "left" : "right";
      })
      .onUpdate((e) => {
        const deltaY = swipeStartY.value - e.y;
        const normalizedDelta = deltaY / 150; // 150 pixels for full range
        if (onSwipeUpdate) {
          runOnJS(onSwipeUpdate)(swipeSide.value, normalizedDelta);
        }
      })
      .onEnd(() => {
        if (onSwipeEnd) {
          runOnJS(onSwipeEnd)(swipeSide.value);
        }
      });

    const composed = Gesture.Exclusive(longPress, tap, verticalPan);

    const leftStyle = useAnimatedStyle(() => ({
      opacity: leftOpacity.value,
    }));
    const rightStyle = useAnimatedStyle(() => ({
      opacity: rightOpacity.value,
    }));

    return (
      <GestureDetector gesture={composed}>
        <View style={StyleSheet.absoluteFill} collapsable={false}>
          {children}
          <Animated.View
            style={[styles.seekFlash, styles.left, leftStyle]}
            pointerEvents="none"
          >
            <IconSkip direction="back" size={40} />
          </Animated.View>
          <Animated.View
            style={[styles.seekFlash, styles.right, rightStyle]}
            pointerEvents="none"
          >
            <IconSkip direction="forward" size={40} />
          </Animated.View>
        </View>
      </GestureDetector>
    );
  },
);

GestureLayer.displayName = "GestureLayer";

export default GestureLayer;
export { SEEK_SKIP_SECONDS };

const styles = StyleSheet.create({
  seekFlash: {
    position: "absolute",
    top: "42%",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 122, 0, 0.16)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 122, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 8,
  },
  left: { left: "18%" },
  right: { right: "18%" },
});
