import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import type { ProductType } from "../types/player.types";

type Props = {
  item: ProductType;
  variant?: "card" | "compact";
};

const ProductCard = memo(({ item, variant = "card" }: Props) => {
  const priceLabel =
    typeof item.price === "number" ? `₹ ${item.price}` : `₹ ${item.price}`;

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={styles.compact}
        onPress={() => item.buyLink && Linking.openURL(item.buyLink)}
      >
        <Image source={{ uri: item.image }} style={styles.compactImg} />
        <View style={styles.compactMeta}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.price}>{priceLabel}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => item.buyLink && Linking.openURL(item.buyLink)}
      >
        <Text style={styles.buttonText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    width: 168,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    marginRight: 12,
    padding: 10,
  },
  image: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 10,
  },
  price: {
    color: "#BBBBBB",
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#000000",
    fontSize: 14,
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  compactImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#333",
  },
  compactMeta: {
    marginLeft: 10,
    flex: 1,
  },
});
