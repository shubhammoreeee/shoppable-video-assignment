import React, { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  IconBack,
  IconClose,
  IconPiP,
  IconCast,
  IconSubtitles,
  IconSettings,
  IconOrientation,
} from "./PlayerIcons";
import { HIT_SLOP, TYPO } from "./styles/playerTheme";

type Props = {
  title: string;
  isLandscape: boolean;
  controlsOpacity: SharedValue<number>;
  onClose: () => void;
  onCast?: () => void;
  onSubtitles?: () => void;
  onSettings: () => void;
  onToggleOrientation: () => void;
  onPiP?: () => void;
};

const TopOverlay = memo(
  ({
    title,
    isLandscape,
    controlsOpacity,
    onClose,
    onCast,
    onSubtitles,
    onSettings,
    onToggleOrientation,
    onPiP,
  }: Props) => {
    const insets = useSafeAreaInsets();

    const fadeStyle = useAnimatedStyle(() => ({
      opacity: controlsOpacity.value,
    }));

    return (
      <View
        style={[styles.wrap, { paddingTop: Math.max(insets.top, 8) + 4 }]}
        pointerEvents="box-none"
      >
        <Animated.View style={fadeStyle} pointerEvents="box-none">
          {isLandscape ? (
            <View style={styles.landscapeHeader}>
              <Text style={TYPO.titleLandscape} numberOfLines={1}>
                {title}
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={HIT_SLOP}
                style={styles.iconBtn}
                accessibilityLabel="Close"
              >
                <IconClose size={26} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.iconRow}>
                <View style={styles.leftIcons}>
                  <Pressable
                    onPress={onClose}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                    accessibilityLabel="Back"
                  >
                    <IconBack size={26} />
                  </Pressable>
                  <Pressable
                    onPress={onPiP}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                    accessibilityLabel="Picture in picture"
                  >
                    <IconPiP size={22} />
                  </Pressable>
                </View>
                <View style={styles.rightIcons}>
                  <Pressable onPress={onCast} hitSlop={HIT_SLOP} style={styles.iconBtn}>
                    <IconCast size={24} />
                  </Pressable>
                  <Pressable
                    onPress={onSubtitles}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                  >
                    <IconSubtitles size={24} />
                  </Pressable>
                  <Pressable
                    onPress={onSettings}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                  >
                    <IconSettings size={24} />
                  </Pressable>
                  <Pressable
                    onPress={onToggleOrientation}
                    hitSlop={HIT_SLOP}
                    style={styles.iconBtn}
                  >
                    <IconOrientation size={22} />
                  </Pressable>
                </View>
              </View>
              <Text style={TYPO.title} numberOfLines={2}>
                {title}
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    );
  },
);

TopOverlay.displayName = "TopOverlay";

export default TopOverlay;

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    zIndex: 20,
  },
  landscapeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    minHeight: 40,
  },
  leftIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBtn: {
    padding: 4,
    minWidth: 36,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
