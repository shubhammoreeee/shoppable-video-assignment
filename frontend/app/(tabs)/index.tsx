import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";
import { BASE_URL } from "../../../shoppableOTT/src/shared/constants/config";

type VideoType = {

  id: string;

  videoUrl: string;
};

export default function HomeScreen() {

  const [videos, setVideos] =
    useState<VideoType[]>([]);

  // FETCH VIDEOS
  const fetchVideos =
    async () => {

      try {

        const response =
          await fetch(
            `${BASE_URL}/videos`
          );

        const data =
          await response.json();

        console.log(
          "VIDEOS:",
          data
        );

        setVideos(data);

      } catch (error) {

        console.log(error);
      }
    };

  useEffect(() => {

    fetchVideos();

  }, []);

  // VIDEO ITEM
  const renderItem = ({
    item,
  }: {
    item: VideoType;
  }) => (

    <TouchableOpacity

      style={styles.card}

      onPress={() => {

        router.push({

          pathname:
            "/VideoScreen",

          params: {

            videoUrl:
              item.videoUrl,

            videoId:
              item.id,
          },
        });
      }}
    >

      <Text
        style={styles.title}
      >
        Video ID:
        {" "}
        {item.id}
      </Text>

    </TouchableOpacity>
  );

  return (

    <View
      style={styles.container}
    >

      <Text
        style={styles.heading}
      >
        Uploaded Videos
      </Text>

      <FlatList
        data={videos}

        keyExtractor={(
          item
        ) => item.id}

        renderItem={
          renderItem
        }
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      padding: 20,
      backgroundColor:
        "#fff",
    },

    heading: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 20,
    },

    card: {
      backgroundColor:
        "#f5f5f5",

      padding: 20,

      borderRadius: 14,

      marginBottom: 15,
    },

    title: {
      fontSize: 18,
      fontWeight: "600",
    },
  });