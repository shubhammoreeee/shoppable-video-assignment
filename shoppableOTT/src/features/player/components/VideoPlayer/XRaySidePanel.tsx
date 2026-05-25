import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ProductType } from "../../types/player.types";

type Props = {
  sceneProducts: ProductType[];
  onClose: () => void;
};

const XRaySidePanel = memo(({ sceneProducts, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.panel, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.handle} />
      <View style={styles.badgeRow}>
        <View style={styles.xrayBadge}>
          <Text style={styles.xrayBadgeText}>X-Ray</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.collapse}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Shop This Scene</Text>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {sceneProducts.map((p) => (
          <View key={String(p.id)} style={styles.productRow}>
            <Image source={{ uri: p.image }} style={styles.productImg} />
            <View style={styles.productMeta}>
              <Text style={styles.productName} numberOfLines={2}>
                {p.name}
              </Text>
              <Text style={styles.productPrice}>₹ {p.price}</Text>
              <Pressable
                style={styles.buyBtn}
                onPress={() => p.buyLink && Linking.openURL(p.buyLink)}
              >
                <Text style={styles.buyText}>Buy Now</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

XRaySidePanel.displayName = "XRaySidePanel";

export default XRaySidePanel;

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(255,255,255,0.12)",
    maxWidth: "42%",
    minWidth: 280,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  xrayBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  xrayBadgeText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
  },
  collapse: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 22,
    fontWeight: "300",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
