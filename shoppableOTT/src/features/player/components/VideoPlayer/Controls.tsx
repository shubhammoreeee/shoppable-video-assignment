import React, { memo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { IconPlay, IconPause, IconSkip } from "./PlayerIcons";
import { COLORS } from "./styles/playerTheme";
import { BUTTON_PRESS_SCALE, SEEK_SKIP_SECONDS } from "./constants";

type Props = {
  paused: boolean;
  controlsOpacity: SharedValue<number>;
  onPlayPause: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  variant?: "overlay" | "inline";
  /** Smaller controls for X-Ray / shop overlay */
  minimal?: boolean;
};

const Controls = memo(
  ({
    paused,
    controlsOpacity,
    onPlayPause,
    onSeekBack,
    onSeekForward,
    variant = "overlay",
    minimal = false,
  }: Props) => {
    const skipSize = minimal ? 36 : 44;
    const playSize = minimal ? 28 : 34;
    const playBtn = minimal ? 52 : 64;
    const gap = minimal ? 28 : 36;
    const playScale = useSharedValue(1);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: controlsOpacity.value,
    }));

    const playAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: playScale.value }],
    }));

    const wrapStyle =
      variant === "overlay" ? styles.centerWrap : styles.inlineWrap;

    return (
      <View style={wrapStyle} pointerEvents="box-none">
        <Animated.View
          style={[styles.row, { gap }, containerStyle]}
          pointerEvents="box-none"
        >
          {!minimal ? (
            <Pressable
              onPress={onSeekBack}
              style={styles.skipBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Rewind 10 seconds"
            >
              <IconSkip direction="back" size={skipSize} />
            </Pressable>
          ) : null}

          <Animated.View style={playAnimStyle}>
            <Pressable
              onPress={onPlayPause}
              onPressIn={() => {
                playScale.value = withSpring(BUTTON_PRESS_SCALE);
              }}
              onPressOut={() => {
                playScale.value = withSpring(1);
              }}
              style={[
                styles.playBtn,
                {
                  width: playBtn,
                  height: playBtn,
                  borderRadius: playBtn / 2,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={paused ? "Play" : "Pause"}
            >
              {paused ? (
                <IconPlay size={playSize} />
              ) : (
                <IconPause size={playSize} />
              )}
            </Pressable>
          </Animated.View>

          {!minimal ? (
            <Pressable
              onPress={onSeekForward}
              style={styles.skipBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Forward 10 seconds"
            >
              <IconSkip direction="forward" size={skipSize} />
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    );
  },
);

Controls.displayName = "Controls";

export default Controls;

const styles = StyleSheet.create({
  centerWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 15,
  },
  inlineWrap: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  skipBtn: {
    padding: 4,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 122, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#FF7A00",
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.8,
    // shadowRadius: 10,
    // elevation: 8,
  },
});

export { SEEK_SKIP_SECONDS };
