import React, {
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  Video,
  ResizeMode,
} from "expo-av";

import {
  useLocalSearchParams,
} from "expo-router";

import { BASE_URL } from "../../../shoppableOTT/src/shared/constants/config";

type ProductType = {
  id: number;
  videoId: string;
  name: string;
  price: number;
  image: string;
  buyLink: string;
  tags: string[];
};

type DetectedObjectType = {
  name: string;
  confidence: number;
};

type ApiResponseType = {
  frame: string;
  timestamp: number;
  detectedObjects: DetectedObjectType[];
  matchedProducts: ProductType[];
};

export default function VideoScreen() {

  const videoRef =
    useRef<Video | null>(null);

  // ROUTER PARAMS
  const {
    videoUrl,
    videoId,
  } = useLocalSearchParams();

  const [products, setProducts] =
    useState<ProductType[]>([]);

  const [
    detectedObjects,
    setDetectedObjects,
  ] = useState<
    DetectedObjectType[]
  >([]);

  const [showProducts, setShowProducts] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // Prevent duplicate API calls
  const lastPauseTimeRef =
    useRef<number | null>(null);

  // FETCH PRODUCTS
  const fetchProducts = async (
    time: number
  ) => {

    try {

      setLoading(true);

      const response =
        await fetch(
          `${BASE_URL}/pause`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              currentTime: time,

              videoId,
            }),
          }
        );

      const data: ApiResponseType =
        await response.json();

      console.log(
        "API RESPONSE:",
        data
      );

      setProducts(
        data.matchedProducts || []
      );

      setDetectedObjects(
        data.detectedObjects || []
      );

      setShowProducts(true);

      setLoading(false);

    } catch (error) {

      console.log(
        "FETCH ERROR:",
        error
      );

      setLoading(false);
    }
  };

  return (

    <View style={styles.container}>

      {/* VIDEO PLAYER */}

      <Video
        ref={videoRef}

        source={{
          uri: videoUrl as string,
        }}

        style={styles.video}

        resizeMode={
          ResizeMode.CONTAIN
        }

        useNativeControls

        shouldPlay

        onPlaybackStatusUpdate={(
          status
        ) => {

          if (
            !status.isLoaded
          )
            return;

          const currentTime =
            status.positionMillis /
            1000;

          // VIDEO PAUSED
          if (
            !status.isPlaying
          ) {

            if (
              lastPauseTimeRef.current !==
              Math.floor(
                currentTime
              )
            ) {

              lastPauseTimeRef.current =
                Math.floor(
                  currentTime
                );

              console.log(
                "Paused At:",
                currentTime
              );

              fetchProducts(
                currentTime
              );
            }
          }

          // VIDEO PLAYING
          else {

            setShowProducts(
              false
            );
          }
        }}
      />

      {/* LOADING */}

      {
        loading && (

          <View
            style={
              styles.loadingContainer
            }
          >

            <ActivityIndicator
              size="large"
              color="black"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Analyzing Scene...
            </Text>

          </View>
        )
      }

      {/* PRODUCT SECTION */}

      {
        showProducts &&
        !loading && (

          <View
            style={
              styles.productSection
            }
          >

            {/* TITLE */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Shop This Scene
            </Text>

            {/* DETECTED OBJECTS */}

            <ScrollView
              horizontal

              showsHorizontalScrollIndicator={
                false
              }

              style={
                styles.detectedScroll
              }
            >

              {
                detectedObjects.map(
                  (
                    item,
                    index
                  ) => (

                    <View
                      key={index}

                      style={
                        styles.objectChip
                      }
                    >

                      <Text
                        style={
                          styles.objectText
                        }
                      >
                        {
                          item.name
                        }
                      </Text>

                    </View>
                  )
                )
              }

            </ScrollView>

            {/* PRODUCT LIST */}

            <ScrollView
              horizontal

              showsHorizontalScrollIndicator={
                false
              }

              contentContainerStyle={{
                paddingHorizontal: 10,
              }}
            >

              {
                products.map(
                  (
                    item
                  ) => (

                    <View
                      key={
                        item.id
                      }

                      style={
                        styles.productCard
                      }
                    >

                      {/* IMAGE */}

                      <Image
                        source={{
                          uri:
                            item.image,
                        }}

                        style={
                          styles.productImage
                        }
                      />

                      {/* NAME */}

                      <Text
                        style={
                          styles.productName
                        }
                      >
                        {
                          item.name
                        }
                      </Text>

                      {/* PRICE */}

                      <Text
                        style={
                          styles.productPrice
                        }
                      >
                        ₹ {
                          item.price
                        }
                      </Text>

                      {/* TAGS */}

                      <ScrollView
                        horizontal

                        showsHorizontalScrollIndicator={
                          false
                        }

                        style={{
                          marginTop: 10,
                        }}
                      >

                        {
                          item.tags?.map(
                            (
                              tag,
                              index
                            ) => (

                              <View
                                key={
                                  index
                                }

                                style={
                                  styles.tagChip
                                }
                              >

                                <Text>
                                  {
                                    tag
                                  }
                                </Text>

                              </View>
                            )
                          )
                        }

                      </ScrollView>

                      {/* BUY BUTTON */}

                      <TouchableOpacity

                        onPress={() => {

                          if (
                            item.buyLink
                          ) {

                            Linking.openURL(
                              item.buyLink
                            );
                          }
                        }}

                        style={
                          styles.buyButton
                        }
                      >

                        <Text
                          style={
                            styles.buyButtonText
                          }
                        >
                          Buy Now
                        </Text>

                      </TouchableOpacity>

                    </View>
                  )
                )
              }

            </ScrollView>

          </View>
        )
      }

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  video: {
    width: "100%",
    height: 320,
    backgroundColor: "black",
  },

  loadingContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },

  productSection: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 12,
    marginBottom: 10,
  },

  detectedScroll: {
    marginBottom: 15,
    paddingLeft: 10,
  },

  objectChip: {
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },

  objectText: {
    fontWeight: "600",
  },

  productCard: {
    width: 210,
    backgroundColor: "#fff",
    marginRight: 15,
    borderRadius: 14,
    padding: 12,
    elevation: 5,
  },

  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 12,
  },

  productName: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 10,
  },

  productPrice: {
    fontSize: 15,
    marginTop: 5,
    color: "#555",
  },

  tagChip: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },

  buyButton: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },

  buyButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});