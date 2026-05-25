import React, { useState, useCallback } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Player from "../components/VideoPlayer/Player";
import usePlayer from "../hooks/usePlayer";
import { pauseDetectionApi } from "../services/playerApi";
import { DEFAULT_MOVIE_TITLE } from "../data/mockPlayerData";
import type { ProductType } from "../types/player.types";

type RootStackParamList = {
  Player: {
    videoUrl: string;
    videoId: string;
    title?: string;
  };
};

type PlayerRouteProp = RouteProp<RootStackParamList, "Player">;

const PlayerScreen = () => {
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation();
  const { videoUrl, videoId, title } = route.params;

  const {
    paused,
    setPaused,
    currentTime,
    setCurrentTime,
    setDuration,
  } = usePlayer();

  const [sceneProducts, setSceneProducts] = useState<ProductType[]>([]);

  const handlePause = useCallback(async () => {
    setPaused(true);
    try {
      const data = await pauseDetectionApi(currentTime, videoId);
      setSceneProducts(data.matchedProducts ?? []);
    } catch (error) {
      console.log("pause detection:", error);
      setSceneProducts([]);
    }
  }, [currentTime, videoId, setPaused]);

  const handlePlay = useCallback(() => {
    setPaused(false);
  }, [setPaused]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Player
        videoUrl={videoUrl}
        videoId={videoId}
        title={title ?? DEFAULT_MOVIE_TITLE}
        paused={paused}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        setDuration={setDuration}
        onPause={handlePause}
        onPlay={handlePlay}
        onClose={handleClose}
        sceneProducts={sceneProducts}
      />
    </View>
  );
};

export default PlayerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
