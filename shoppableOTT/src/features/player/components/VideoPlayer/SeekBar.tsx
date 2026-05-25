import React, { memo, useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from "react-native-reanimated";
import type { SceneMarker } from "../../types/player.types";
import { formatTime, formatRemaining } from "../../utils/formatTime";
import { COLORS, TYPO } from "./styles/playerTheme";

type Props = {
  duration: number;
  position: number;
  markers: SceneMarker[];
  isLandscape: boolean;
  onSeekStart: () => void;
  onSeekChange: (value: number) => void;
  onSeekComplete: (value: number) => void;
};

const TRACK_HEIGHT = 3;
const THUMB_SIZE = 14;
const MARKER_SIZE = 6;

const SeekBar = memo(
  ({
    duration,
    position,
    markers,
    isLandscape,
    onSeekStart,
    onSeekChange,
    onSeekComplete,
  }: Props) => {
    const trackWidth = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const isDraggingRef = useRef(false);
    const dragProgress = useSharedValue(0);
    const thumbScale = useSharedValue(1);

    const safeDuration = duration > 0 ? duration : 1;
    const progressSV = useSharedValue(0);

    useEffect(() => {
      if (!isDraggingRef.current) {
        progressSV.value = Math.min(1, Math.max(0, position / safeDuration));
      }
    }, [position, safeDuration, progressSV]);

    const updateFromX = useCallback(
      (x: number, complete: boolean) => {
        const w = trackWidth.value;
        if (w <= 0) return;
        const ratio = Math.min(1, Math.max(0, x / w));
        const time = ratio * safeDuration;
        if (complete) {
          onSeekComplete(time);
        } else {
          onSeekChange(time);
        }
      },
      [onSeekChange, onSeekComplete, safeDuration, trackWidth],
    );

    const pan = Gesture.Pan()
      .onBegin((e) => {
        isDragging.value = true;
        isDraggingRef.current = true;
        thumbScale.value = withSpring(1.35);
        runOnJS(onSeekStart)();
        const ratio = Math.min(1, Math.max(0, e.x / trackWidth.value));
        dragProgress.value = ratio;
        runOnJS(updateFromX)(e.x, false);
      })
      .onUpdate((e) => {
        const ratio = Math.min(1, Math.max(0, e.x / trackWidth.value));
        dragProgress.value = ratio;
        runOnJS(updateFromX)(e.x, false);
      })
      .onEnd((e) => {
        isDragging.value = false;
        isDraggingRef.current = false;
        thumbScale.value = withSpring(1);
        runOnJS(updateFromX)(e.x, true);
      })
      .onFinalize(() => {
        isDragging.value = false;
        isDraggingRef.current = false;
        thumbScale.value = withSpring(1);
      });

    const tap = Gesture.Tap().onEnd((e) => {
      runOnJS(onSeekStart)();
      const ratio = Math.min(1, Math.max(0, e.x / trackWidth.value));
      dragProgress.value = ratio;
      runOnJS(updateFromX)(e.x, true);
    });

    const composed = Gesture.Race(pan, tap);

    const onTrackLayout = (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    };

    const fillStyle = useAnimatedStyle(() => {
      const p = isDragging.value ? dragProgress.value : progressSV.value;
      return { width: Math.max(0, p * trackWidth.value) };
    });

    const thumbStyle = useAnimatedStyle(() => {
      const p = isDragging.value ? dragProgress.value : progressSV.value;
      return {
        transform: [
          { translateX: p * trackWidth.value - THUMB_SIZE / 2 },
          { scale: thumbScale.value },
        ],
      };
    });

    return (
      <View style={styles.wrap}>
        {isLandscape && (
          <View style={styles.timeRow}>
            <Text style={[TYPO.time, styles.timeLeft]}>
              {formatTime(position)}
            </Text>
            <Text style={[TYPO.time, styles.timeRight]}>
              {formatRemaining(position, duration)}
            </Text>
          </View>
        )}

        <GestureDetector gesture={composed}>
          <View style={styles.trackContainer} onLayout={onTrackLayout}>
            <View style={styles.trackBg} />
            <Animated.View style={[styles.trackFill, fillStyle]} />
            {markers.map((m) => {
              const pct = (m.time / safeDuration) * 100;
              if (pct < 0 || pct > 100) return null;
              return (
                <View
                  key={m.id}
                  style={[styles.marker, { left: `${pct}%` }]}
                  pointerEvents="none"
                />
              );
            })}
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>

        {!isLandscape && (
          <View style={styles.timeRowPortrait}>
            <Text style={TYPO.time}>{formatTime(position)}</Text>
            <Text style={TYPO.time}>
              {formatRemaining(position, duration)}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

SeekBar.displayName = "SeekBar";

export default SeekBar;

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: 16,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  timeRowPortrait: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  timeLeft: {},
  timeRight: {},
  trackContainer: {
    height: 28,
    justifyContent: "center",
  },
  trackBg: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: COLORS.trackRemaining,
    width: "100%",
  },
  trackFill: {
    position: "absolute",
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: COLORS.trackPlayed,
  },
  marker: {
    position: "absolute",
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: COLORS.markerYellow,
    top: "50%",
    marginTop: -MARKER_SIZE / 2,
    marginLeft: -MARKER_SIZE / 2,
    zIndex: 2,
  },
  thumb: {
    position: "absolute",
    left: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.white,
    top: "50%",
    marginTop: -THUMB_SIZE / 2,
    zIndex: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
});
