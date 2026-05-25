import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";

import {
  pick,
  types,
} from
"@react-native-documents/picker";

import {
  uploadVideoApi,
} from "../services/uploadApi";

/* ---------------- TYPES ---------------- */

type ProductType = {

  name: string;

  price: string;

  image: any;

  buyLink: string;

  tags: string;
};

/* ---------------- SCREEN ---------------- */

const UploadScreen = () => {

  const [video, setVideo] =
    useState<any>(null);

  const [products, setProducts] =
    useState<ProductType[]>([
      {
        name: "",
        price: "",
        image: null,
        buyLink: "",
        tags: "",
      },
    ]);

  /* ---------------- PICK VIDEO ---------------- */

  const pickVideo =
    async () => {

      try {

        const result =
          await pick({

            type: [types.video],
          });

        setVideo(result[0]);

      } catch (error) {

        console.log(error);
      }
    };

  /* ---------------- PICK PRODUCT IMAGE ---------------- */

  const pickProductImage =
    async (
      index: number
    ) => {

      try {

        const result =
          await pick({

            type: [types.images],
          });

        const updatedProducts =
          [...products];

        updatedProducts[index].image =
          result[0];

        setProducts(
          updatedProducts
        );

      } catch (error) {

        console.log(error);
      }
    };

  /* ---------------- ADD PRODUCT ---------------- */

  const addProduct =
    () => {

      setProducts([
        ...products,

        {
          name: "",
          price: "",
          image: null,
          buyLink: "",
          tags: "",
        },
      ]);
    };

  /* ---------------- REMOVE PRODUCT ---------------- */

  const removeProduct =
    (index: number) => {

      const updatedProducts =
        products.filter(
          (_, i) =>
            i !== index
        );

      setProducts(
        updatedProducts
      );
    };

  /* ---------------- UPDATE FIELD ---------------- */

  const updateProductField = (

    index: number,

    field: keyof ProductType,

    value: string

  ) => {

    const updatedProducts =
      [...products];

    updatedProducts[index] = {

      ...updatedProducts[index],

      [field]: value,
    };

    setProducts(
      updatedProducts
    );
  };

  /* ---------------- UPLOAD ---------------- */

  const uploadData =
    async () => {

      if (!video) {

        Alert.alert(
          "Select Video"
        );

        return;
      }

      const formData =
        new FormData();

      /* VIDEO */

      formData.append(

        "video",

        {

          uri: video.uri,

          name: video.name,

          type:
            video.type ||
            "video/mp4",
        } as any
      );

      /* PRODUCT IMAGES */

      products.forEach(

        (
          product,
          index
        ) => {

          if (product.image) {

            formData.append(

              `productImage_${index}`,

              {

                uri:
                  product.image.uri,

                name:
                  product.image.name ||

                  `product_${index}.jpg`,

                type:
                  product.image.type ||

                  "image/jpeg",
              } as any
            );
          }
        }
      );

      /* PRODUCTS JSON */

      formData.append(

        "products",

        JSON.stringify(
          products.map(
            (item) => ({

              name:
                item.name,

              price:
                item.price,

              buyLink:
                item.buyLink,

              tags:
                item.tags,
            })
          )
        )
      );

      try {

        const data =
          await uploadVideoApi(
            formData
          );

        console.log(
          "UPLOAD:",
          data
        );

        Alert.alert(
          "Success",
          "Video Uploaded"
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Upload Failed"
        );
      }
    };

  /* ---------------- UI ---------------- */

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      <Text style={styles.title}>
        Upload Video
      </Text>

      {/* PICK VIDEO */}

      <TouchableOpacity

        style={styles.videoButton}

        onPress={pickVideo}
      >

        <Text style={styles.buttonText}>
          Pick Video
        </Text>

      </TouchableOpacity>

      {

        video && (

          <Text style={styles.fileName}>
            {video.name}
          </Text>
        )
      }

      {/* PRODUCTS */}

      {

        products.map(

          (
            item,
            index
          ) => (

            <View

              key={index}

              style={
                styles.productContainer
              }
            >

              <View
                style={
                  styles.headerRow
                }
              >

                <Text
                  style={
                    styles.productTitle
                  }
                >
                  Product {index + 1}
                </Text>

                {

                  products.length > 1 && (

                    <TouchableOpacity

                      onPress={() =>
                        removeProduct(
                          index
                        )
                      }
                    >

                      <Text
                        style={
                          styles.removeText
                        }
                      >
                        Remove
                      </Text>

                    </TouchableOpacity>
                  )
                }

              </View>

              {/* PRODUCT NAME */}

              <TextInput
                placeholder="Product Name"
                style={styles.input}
                value={item.name}
                onChangeText={(text) =>
                  updateProductField(
                    index,
                    "name",
                    text
                  )
                }
              />

              {/* PRICE */}

              <TextInput
                placeholder="Price"
                style={styles.input}
                value={item.price}
                onChangeText={(text) =>
                  updateProductField(
                    index,
                    "price",
                    text
                  )
                }
              />

              {/* IMAGE PICKER */}

              <TouchableOpacity

                style={styles.imageButton}

                onPress={() =>
                  pickProductImage(
                    index
                  )
                }
              >

                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Pick Product Image
                </Text>

              </TouchableOpacity>

              {

                item.image && (

                  <Image

                    source={{
                      uri:
                        item.image.uri,
                    }}

                    style={
                      styles.previewImage
                    }
                  />
                )
              }

              {/* BUY LINK */}

              <TextInput
                placeholder="Buy Link"
                style={styles.input}
                value={item.buyLink}
                onChangeText={(text) =>
                  updateProductField(
                    index,
                    "buyLink",
                    text
                  )
                }
              />

              {/* TAGS */}

              <TextInput
                placeholder="Tags (comma separated)"
                style={styles.input}
                value={item.tags}
                onChangeText={(text) =>
                  updateProductField(
                    index,
                    "tags",
                    text
                  )
                }
              />

            </View>
          )
        )
      }

      {/* ADD PRODUCT */}

      <TouchableOpacity

        style={styles.addButton}

        onPress={addProduct}
      >

        <Text style={styles.buttonText}>
          Add Another Product
        </Text>

      </TouchableOpacity>

      {/* UPLOAD */}

      <TouchableOpacity

        style={styles.uploadButton}

        onPress={uploadData}
      >

        <Text style={styles.uploadText}>
          Upload Video
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
};

export default UploadScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  container: {

    padding: 20,

    backgroundColor: "#fff",

    paddingBottom: 100,
  },

  title: {

    fontSize: 28,

    fontWeight: "bold",

    marginBottom: 20,
  },

  videoButton: {

    backgroundColor: "#000",

    padding: 15,

    borderRadius: 12,

    marginBottom: 15,
  },

  buttonText: {

    color: "#fff",

    textAlign: "center",

    fontWeight: "bold",
  },

  fileName: {

    marginBottom: 20,

    color: "#444",
  },

  productContainer: {

    borderWidth: 1,

    borderColor: "#ddd",

    borderRadius: 16,

    padding: 15,

    marginBottom: 20,
  },

  headerRow: {

    flexDirection: "row",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 10,
  },

  productTitle: {

    fontSize: 20,

    fontWeight: "bold",
  },

  removeText: {

    color: "red",

    fontWeight: "bold",
  },

  input: {

    borderWidth: 1,

    borderColor: "#ddd",

    padding: 14,

    borderRadius: 12,

    marginBottom: 15,
  },

  imageButton: {

    backgroundColor: "#222",

    padding: 14,

    borderRadius: 12,

    marginBottom: 15,
  },

  previewImage: {

    width: "100%",

    height: 220,

    borderRadius: 14,

    marginBottom: 15,
  },

  addButton: {

    backgroundColor: "#444",

    padding: 15,

    borderRadius: 12,

    marginBottom: 20,
  },

  uploadButton: {

    backgroundColor: "green",

    padding: 18,

    borderRadius: 14,
  },

  uploadText: {

    color: "white",

    textAlign: "center",

    fontWeight: "bold",

    fontSize: 16,
  },
});