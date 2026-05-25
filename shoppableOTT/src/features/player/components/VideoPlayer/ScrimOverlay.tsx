import React, { memo } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type Props = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  pointerEvents?: "box-none" | "none" | "auto";
};

/** Layout wrapper only — no dark scrim bands (avoids ghost overlays when controls hide). */
const ScrimOverlay = memo(
  ({ style, children, pointerEvents = "box-none" }: Props) => (
    <View style={[styles.root, style]} pointerEvents={pointerEvents}>
      {children}
    </View>
  ),
);

ScrimOverlay.displayName = "ScrimOverlay";

export default ScrimOverlay;

const styles = StyleSheet.create({
  root: {
    overflow: "hidden",
  },
});
