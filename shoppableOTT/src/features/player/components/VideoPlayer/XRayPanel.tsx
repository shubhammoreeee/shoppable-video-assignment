import React, { memo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ActorInfo, ProductType } from "../../types/player.types";
import ProductCard from "../ProductCard";
import { TYPO, HIT_SLOP } from "./styles/playerTheme";
import { BUTTON_PRESS_SCALE } from "./constants";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_H * 0.52;

type Props = {
  actor: ActorInfo;
  sceneProducts: ProductType[];
  isLandscape: boolean;
  controlsOpacity: SharedValue<number>;
  sheetOpen: boolean;
  onOpenSheet: () => void;
  onCloseSheet: () => void;
};

const XRayPanel = memo(
  ({
    actor,
    sceneProducts,
    isLandscape,
    controlsOpacity,
    sheetOpen,
    onOpenSheet,
    onCloseSheet,
  }: Props) => {
    const insets = useSafeAreaInsets();
    const pillScale = useSharedValue(1);
    const translateY = useSharedValue(SHEET_HEIGHT);

    const openSheet = useCallback(() => {
      onOpenSheet();
      translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
    }, [onOpenSheet, translateY]);

    useEffect(() => {
      if (sheetOpen) {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      } else {
        translateY.value = SHEET_HEIGHT;
      }
    }, [sheetOpen, translateY]);

    const closeSheet = useCallback(() => {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 260 }, () => {
        runOnJS(onCloseSheet)();
      });
    }, [onCloseSheet, translateY]);

    const pan = Gesture.Pan()
      .onUpdate((e) => {
        if (e.translationY > 0) translateY.value = e.translationY;
      })
      .onEnd((e) => {
        if (e.translationY > 80 || e.velocityY > 500) {
          runOnJS(closeSheet)();
        } else {
          translateY.value = withSpring(0);
        }
      });

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const footerStyle = useAnimatedStyle(() => ({
      opacity: controlsOpacity.value,
    }));

    const pillAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pillScale.value }],
    }));

    return (
      <>
        {!isLandscape && (
          <Animated.View style={[styles.portraitFooter, footerStyle]}>
            <View style={styles.actorRow}>
              <Image source={{ uri: actor.imageUri }} style={styles.avatar} />
              <Text style={TYPO.actor} numberOfLines={2}>
                {actor.name} - {actor.character}
              </Text>
            </View>
            <Pressable
              onPress={openSheet}
              onPressIn={() => {
                pillScale.value = withSpring(BUTTON_PRESS_SCALE);
              }}
              onPressOut={() => {
                pillScale.value = withSpring(1);
              }}
              style={styles.pillCenter}
            >
              <Animated.View style={[styles.xrayPill, pillAnimStyle]}>
                <Text style={TYPO.xrayPill}>Shop Here</Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        )}

        {isLandscape && (
          <Animated.View style={[styles.landscapeFooter, footerStyle]}>
            <Pressable
              onPress={openSheet}
              hitSlop={HIT_SLOP}
              style={styles.landscapePillWrap}
            >
              <Animated.View style={[styles.xrayPill, pillAnimStyle]}>
                <Text style={TYPO.xrayPill}>🛍 Shop Here</Text>
              </Animated.View>
            </Pressable>
            <View style={styles.actorRowInline}>
              <Image source={{ uri: actor.imageUri }} style={styles.avatar} />
              <Text style={TYPO.actor} numberOfLines={1}>
                {actor.name} - {actor.character}
              </Text>
            </View>
          </Animated.View>
        )}

        <SheetModal
          visible={sheetOpen}
          sheetStyle={sheetStyle}
          pan={pan}
          sceneProducts={sceneProducts}
          insets={insets}
          onClose={closeSheet}
        />
      </>
    );
  },
);

type SheetProps = {
  visible: boolean;
  sheetStyle: ReturnType<typeof useAnimatedStyle>;
  pan: ReturnType<typeof Gesture.Pan>;
  sceneProducts: ProductType[];
  insets: { bottom: number };
  onClose: () => void;
};

const SheetModal = memo(
  ({ visible, sheetStyle, pan, sceneProducts, insets, onClose }: SheetProps) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetBadge}>
            <Text style={styles.sheetBadgeText}>Shop Here</Text>
          </View>

          <Text style={styles.shopTitle}>Shop This Scene</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.shopScrollContent}
          >
            {sceneProducts.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sceneProducts.map((p) => (
                  <ProductCard key={String(p.id)} item={p} variant="card" />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.empty}>No products detected in this scene.</Text>
            )}
          </ScrollView>

          <Pressable style={styles.closeSheetBtn} onPress={onClose}>
            <Text style={styles.closeSheetText}>Close</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Modal>
  ),
);

XRayPanel.displayName = "XRayPanel";
SheetModal.displayName = "SheetModal";

export default XRayPanel;

const styles = StyleSheet.create({
  portraitFooter: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
  },
  landscapeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 4,
  },
  landscapePillWrap: { marginRight: 12 },
  actorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "flex-start",
    width: "100%",
    marginBottom: 10,
  },
  actorRowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
  },
  pillCenter: { alignSelf: "center" },
  xrayPill: {
    backgroundColor: "rgba(20,10,0,0.82)",
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,122,0,0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#121212",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF7A00",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  sheetBadgeText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  shopTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 14,
  },
  shopScrollContent: {
    paddingBottom: 8,
  },
  empty: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 24,
  },
  closeSheetBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  closeSheetText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
