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
} from "react-native";

import * as DocumentPicker from "expo-document-picker";

type ProductType = {
  name: string;
  price: string;
  image: any;
  buyLink: string;
  tags: string;
};

export default function UploadScreen() {

  const [video, setVideo] =
    useState<any>(null);

  const [products, setProducts] =
    useState<ProductType[]>([
      {
        name: "",
        price: "",
        image: "",
        buyLink: "",
        tags: "",
      },
    ]);

    const pickProductImage = async (
  index: number
) => {

  const result =
    await DocumentPicker.getDocumentAsync({

      type: "image/*",
    });

  if (!result.canceled) {

    const updatedProducts =
      [...products];

    updatedProducts[index].image =
      result.assets[0];

    setProducts(
      updatedProducts
    );
  }
};

  // PICK VIDEO
  const pickVideo = async () => {

    const result =
      await DocumentPicker.getDocumentAsync({

        type: "video/*",
      });

    if (!result.canceled) {

      setVideo(
        result.assets[0]
      );
    }
  };

  // ADD PRODUCT
  const addProduct = () => {

    setProducts([
      ...products,

      {
        name: "",
        price: "",
        image: "",
        buyLink: "",
        tags: "",
      },
    ]);
  };

  // UPDATE PRODUCT FIELD
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

  // UPLOAD
  const uploadData = async () => {

    if (!video) {

      Alert.alert(
        "Please select video"
      );

      return;
    }

    const formData =
      new FormData();

    // VIDEO
    formData.append(
      "video",
      {
        uri: video.uri,

        name: video.name,

        type: "video/mp4",
      } as any
    );

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
            product.image.name,

          type:
            "image/jpeg",
        } as any
      );
    }
  }
);

    // MULTIPLE PRODUCTS
    formData.append(
      "products",

      JSON.stringify(
        products
      )
    );

    try {

      const response =
        await fetch(

          "http://192.168.29.235:5000/create-video",

          {
            method: "POST",

            body: formData,
          }
        );

      const data =
        await response.json();

      console.log(data);

      Alert.alert(
        "Success",
        "Video uploaded successfully"
      );

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Upload failed"
      );
    }
  };

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
        style={styles.button}

        onPress={pickVideo}
      >

        <Text
          style={styles.buttonText}
        >
          Pick Video
        </Text>

      </TouchableOpacity>

      {
        video && (

          <Text
            style={styles.videoName}
          >
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

              <Text
                style={
                  styles.productTitle
                }
              >
                Product {index + 1}
              </Text>

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

              {/* <TextInput
                placeholder="Image URL"
                style={styles.input}
                value={item.image}
                onChangeText={(text) =>
                  updateProductField(
                    index,
                    "image",
                    text
                  )
                }
              /> */}
              <TouchableOpacity

  style={styles.imageButton}

  onPress={() =>
    pickProductImage(index)
  }
>

  <Text
    style={{
      color: "white",
      textAlign: "center",
    }}
  >
    Pick Product Image
  </Text>

</TouchableOpacity>

{
  item.image && (

    <Text
      style={{
        marginTop: 8,
      }}
    >
      {
        item.image.name
      }
    </Text>
  )
}

              <TextInput
                placeholder="https://amazon.in"
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

        <Text
          style={styles.buttonText}
        >
          Add Another Product
        </Text>

      </TouchableOpacity>

      {/* UPLOAD */}

      <TouchableOpacity
        style={styles.uploadButton}

        onPress={uploadData}
      >

        <Text
          style={styles.uploadText}
        >
          Upload
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },

  videoName: {
    marginTop: 10,
    marginBottom: 20,
  },

  productContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
imageButton: {
  backgroundColor: "#222",
  padding: 14,
  borderRadius: 10,
  marginBottom: 10,
},
  addButton: {
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  uploadButton: {
    backgroundColor: "green",
    padding: 16,
    borderRadius: 10,
  },

  uploadText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});