import { Platform, StyleSheet } from "react-native";

export const COLORS = {
  black: "#000000",
  white: "#FFFFFF",
  trackPlayed: "#FFFFFF",
  trackRemaining: "rgba(255,255,255,0.28)",
  markerYellow: "#FFEB3B",
  glass: "rgba(0,0,0,0.45)",
  glassLight: "rgba(255,255,255,0.12)",
  glassBorder: "rgba(255,255,255,0.18)",
  xrayPillBg: "rgba(18,18,18,0.85)",
  overlayScrim: "rgba(0,0,0,0.55)",
  accent: "#00A8E1",
};

export const TYPO = {
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
  },
  titleLandscape: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700" as const,
  },
  actor: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500" as const,
  },
  time: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500" as const,
    opacity: 0.95,
  },
  xrayPill: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600" as const,
  },
};

export const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export const shared = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFill,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  glassCircle: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  topSafe: {
    paddingTop: Platform.OS === "ios" ? 8 : 4,
  },
});
