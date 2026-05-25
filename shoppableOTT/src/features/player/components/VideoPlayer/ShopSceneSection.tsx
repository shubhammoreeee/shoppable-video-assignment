import React, { memo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import type { ProductType } from "../../types/player.types";
import ProductCard from "../ProductCard";
import { IconFullscreen } from "./PlayerIcons";

type Props = {
  products: ProductType[];
  onExpandXRay?: () => void;
};

const ShopSceneSection = memo(({ products, onExpandXRay }: Props) => {
  if (!products.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop This Scene</Text>
        {onExpandXRay ? (
          <Pressable onPress={onExpandXRay} hitSlop={12} style={styles.expandBtn}>
            <IconFullscreen size={20} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {products.map((item) => (
          <ProductCard key={String(item.id)} item={item} variant="card" />
        ))}
      </ScrollView>
    </View>
  );
});

ShopSceneSection.displayName = "ShopSceneSection";

export default ShopSceneSection;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(0,0,0,0.94)",
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  expandBtn: {
    padding: 6,
    opacity: 0.85,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
});
