import React, { memo } from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { COLORS } from "./styles/playerTheme";

const WHITE = COLORS.white;

type SizeProps = { size?: number; color?: string };

/** Pure View icons — no icon font required (works on Android without linking). */

export const IconBack = memo(({ size = 26, color = WHITE }: SizeProps) => (
  <View style={[styles.hit, { width: size, height: size }]}>
    <View
      style={{
        width: size * 0.35,
        height: size * 0.35,
        borderLeftWidth: 2.5,
        borderBottomWidth: 2.5,
        borderColor: color,
        transform: [{ rotate: "45deg" }],
        marginLeft: size * 0.22,
      }}
    />
  </View>
));
IconBack.displayName = "IconBack";

export const IconClose = memo(({ size = 26, color = WHITE }: SizeProps) => (
  <Text style={{ color, fontSize: size * 0.9, fontWeight: "300", lineHeight: size }}>
    ✕
  </Text>
));
IconClose.displayName = "IconClose";

export const IconPiP = memo(({ size = 22, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size * 0.72 }}>
    <View
      style={{
        position: "absolute",
        right: 0,
        bottom: 0,
        width: size * 0.62,
        height: size * 0.5,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 2,
      }}
    />
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: size * 0.72,
        height: size * 0.58,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 2,
        backgroundColor: "rgba(0,0,0,0.25)",
      }}
    />
  </View>
));
IconPiP.displayName = "IconPiP";

export const IconCast = memo(({ size = 24, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size, justifyContent: "flex-end" }}>
    <View
      style={{
        width: size * 0.85,
        height: size * 0.55,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 2,
      }}
    />
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: size * 0.35,
        height: size * 0.35,
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderColor: color,
        borderTopRightRadius: size,
      }}
    />
  </View>
));
IconCast.displayName = "IconCast";

export const IconSubtitles = memo(({ size = 24, color = WHITE }: SizeProps) => (
  <View
    style={{
      width: size,
      height: size * 0.72,
      borderWidth: 2,
      borderColor: color,
      borderRadius: 3,
      justifyContent: "center",
      alignItems: "center",
      gap: 3,
      paddingVertical: 4,
    }}
  >
    {[size * 0.5, size * 0.68, size * 0.4].map((w, i) => (
      <View
        key={i}
        style={{ height: 2, width: w, backgroundColor: color, borderRadius: 1 }}
      />
    ))}
  </View>
));
IconSubtitles.displayName = "IconSubtitles";

export const IconSettings = memo(({ size = 24, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <View
      style={{
        width: size * 0.72,
        height: size * 0.72,
        borderRadius: size * 0.36,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <View
        key={deg}
        style={{
          position: "absolute",
          width: 3,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.38 }],
        }}
      />
    ))}
  </View>
));
IconSettings.displayName = "IconSettings";

export const IconPlay = memo(({ size = 32, color = WHITE }: SizeProps) => (
  <View
    style={{
      width: 0,
      height: 0,
      marginLeft: size * 0.15,
      borderStyle: "solid",
      borderLeftWidth: size * 0.55,
      borderTopWidth: size * 0.34,
      borderBottomWidth: size * 0.34,
      borderLeftColor: color,
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    }}
  />
));
IconPlay.displayName = "IconPlay";

export const IconPause = memo(({ size = 32, color = WHITE }: SizeProps) => (
  <View style={{ flexDirection: "row", gap: size * 0.14 }}>
    <View style={{ width: size * 0.16, height: size * 0.55, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.16, height: size * 0.55, backgroundColor: color, borderRadius: 1 }} />
  </View>
));
IconPause.displayName = "IconPause";

export const IconSkip = memo(
  ({
    direction,
    size = 48,
    color = WHITE,
  }: SizeProps & { direction: "back" | "forward" }) => (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size - 4,
          height: size - 4,
          borderRadius: (size - 4) / 2,
          borderWidth: 2,
          borderColor: color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color, fontSize: 11, fontWeight: "700" }}>10</Text>
      </View>
      <View
        style={[
          styles.skipArrow,
          direction === "back" ? styles.skipArrowBack : styles.skipArrowForward,
          {
            borderRightColor: direction === "forward" ? color : "transparent",
            borderLeftColor: direction === "back" ? color : "transparent",
          },
        ]}
      />
    </View>
  ),
);
IconSkip.displayName = "IconSkip";

export const IconFullscreen = memo(({ size = 22, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size }}>
    {[
      { top: 0, left: 0, bt: "borderTopWidth", bl: "borderLeftWidth", rot: undefined },
      { top: 0, right: 0, bt: "borderTopWidth", bl: "borderRightWidth", rot: undefined },
      { bottom: 0, left: 0, bt: "borderBottomWidth", bl: "borderLeftWidth", rot: undefined },
      { bottom: 0, right: 0, bt: "borderBottomWidth", bl: "borderRightWidth", rot: undefined },
    ].map((c, i) => (
      <View
        key={i}
        style={{
          position: "absolute",
          ...(c.top !== undefined ? { top: c.top } : {}),
          ...(c.bottom !== undefined ? { bottom: c.bottom } : {}),
          ...(c.left !== undefined ? { left: c.left } : {}),
          ...(c.right !== undefined ? { right: c.right } : {}),
          width: size * 0.35,
          height: size * 0.35,
          [c.bt]: 2,
          [c.bl]: 2,
          borderColor: color,
        }}
      />
    ))}
  </View>
));
IconFullscreen.displayName = "IconFullscreen";

export const IconFullscreenExit = memo(({ size = 22, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size }}>
    {[
      { top: 2, left: 2 },
      { top: 2, right: 2 },
      { bottom: 2, left: 2 },
      { bottom: 2, right: 2 },
    ].map((pos, i) => (
      <View
        key={i}
        style={{
          position: "absolute",
          ...pos,
          width: size * 0.3,
          height: size * 0.3,
          borderColor: color,
          borderTopWidth: pos.top !== undefined && pos.top < 10 ? 2 : 0,
          borderBottomWidth: pos.bottom !== undefined ? 2 : 0,
          borderLeftWidth: pos.left !== undefined && pos.left < 10 ? 2 : 0,
          borderRightWidth: pos.right !== undefined ? 2 : 0,
        }}
      />
    ))}
  </View>
));
IconFullscreenExit.displayName = "IconFullscreenExit";

export const IconOrientation = memo(({ size = 22, color = WHITE }: SizeProps) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <View
      style={{
        width: size * 0.55,
        height: size * 0.85,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 2,
      }}
    />
    <View
      style={{
        position: "absolute",
        width: size * 0.85,
        height: size * 0.55,
        borderWidth: 2,
        borderColor: color,
        borderRadius: 2,
        backgroundColor: "rgba(0,0,0,0.35)",
        transform: [{ rotate: "90deg" }],
      }}
    />
  </View>
));
IconOrientation.displayName = "IconOrientation";

export const IconChevronUp = memo(({ size = 28, color = WHITE }: SizeProps) => (
  <View
    style={{
      width: size * 0.5,
      height: size * 0.5,
      borderLeftWidth: 2,
      borderTopWidth: 2,
      borderColor: color,
      transform: [{ rotate: "45deg" }],
      marginTop: size * 0.2,
    }}
  />
));
IconChevronUp.displayName = "IconChevronUp";

const styles = StyleSheet.create({
  hit: {
    justifyContent: "center",
    alignItems: "center",
  },
  skipArrow: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  skipArrowBack: {
    left: 2,
    borderRightWidth: 7,
  },
  skipArrowForward: {
    right: 2,
    borderLeftWidth: 7,
  },
});
