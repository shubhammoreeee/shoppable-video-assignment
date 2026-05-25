import React from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import ProductCard
from "./ProductCard";

const ProductOverlay = ({
  products,
}: any) => {

  if (!products.length)
    return null;

  return (

    <View style={styles.container}>

      <Text style={styles.heading}>
        Shop This Scene
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >

        {
          products.map(
            (item: any) => (

              <ProductCard
                key={item.id}
                item={item}
              />
            )
          )
        }

      </ScrollView>

    </View>
  );
};

export default ProductOverlay;

const styles = StyleSheet.create({

  container: {

    position: "absolute",

    bottom: 0,

    width: "100%",

    backgroundColor:
      "rgba(0,0,0,0.92)",

    paddingVertical: 20,

    paddingLeft: 15,
  },

  heading: {

    color: "white",

    fontSize: 22,

    fontWeight: "bold",

    marginBottom: 15,
  },
});