import React, { memo, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProductType } from "../../types/player.types";

type Props = {
  sceneProducts: ProductType[];
  onClose: () => void;
};

const XRaySidePanel = memo(({ sceneProducts, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(320);

  useEffect(() => {
    translateX.value = withSpring(0, {
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    });
  }, [translateX]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.panel,
        panelStyle,
        { paddingTop: Math.max(insets.top, 10) },
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.shopBadge}>
          <Text style={styles.shopBadgeText}>Shop Here</Text>
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={14}
          style={styles.closeBtn}
          accessibilityLabel="Close shop panel"
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Shop This Scene</Text>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 12,
        }}
      >
        {sceneProducts.length === 0 && (
          <Text style={styles.emptyText}>
            No shoppable products in this scene.
          </Text>
        )}

        {sceneProducts.map((p) => (
          <View key={String(p.id)} style={styles.productCard}>
            {/* Image – left */}
            <Image
              source={{ uri: p.image }}
              style={styles.productImg}
              resizeMode="cover"
            />

            {/* Meta – center */}
            <View style={styles.productMeta}>
              <Text style={styles.productName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.productPrice}>₹ {p.price}</Text>
            </View>

            {/* CTA – right */}
            <Pressable
              style={styles.buyBtn}
              onPress={() => p.buyLink && Linking.openURL(p.buyLink)}
              accessibilityLabel={`Buy ${p.name}`}
            >
              <Text style={styles.buyText}>Buy{"\n"}Now</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
});

XRaySidePanel.displayName = "XRaySidePanel";

export default XRaySidePanel;

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,122,0,0.25)",
    maxWidth: "42%",
    minWidth: 280,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
  },
  shopBadge: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  shopBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 15,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    paddingHorizontal: 14,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 28,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  productMeta: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 17,
  },
  productPrice: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    marginTop: 4,
  },
  buyBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  buyText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
  },
});
