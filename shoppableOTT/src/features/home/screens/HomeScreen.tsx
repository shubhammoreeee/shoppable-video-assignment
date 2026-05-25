import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchVideosApi } from "../services/homeApi";
import { VideoType } from "../types/home.types";
import { RootStackParamList } from "../../../app/navigation/types";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const TOP_PAD =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 12;

const HomeScreen = () => {
  const navigation = useNavigation<RootNav>();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPlayer = useCallback(
    (item: VideoType) => {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate("Player", {
          videoUrl: item.videoUrl,
          videoId: item.id,
        });
      } else {
        navigation.navigate("Player", {
          videoUrl: item.videoUrl,
          videoId: item.id,
        });
      }
    },
    [navigation],
  );

  const loadVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchVideosApi();
      setVideos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load videos";
      setError(message);
      setVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const renderItem = ({ item }: { item: VideoType }) => (
    <TouchableOpacity style={styles.card} onPress={() => openPlayer(item)}>
      <Text style={styles.cardTitle}>Video ID: {item.id}</Text>
      <Text style={styles.cardSub} numberOfLines={1}>
        Tap to play
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: TOP_PAD }]}>
      <Text style={styles.heading}>Uploaded Videos</Text>

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.hint}>Loading videos…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.hint}>
            Start your API server or check BASE_URL in config.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadVideos()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            videos.length === 0 ? styles.emptyList : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadVideos(true)}
              tintColor="#E50914"
              colors={["#E50914"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyInner}>
              <Text style={styles.emptyTitle}>No videos yet</Text>
              <Text style={styles.hint}>
                Upload a video from the Upload tab.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyInner: {
    alignItems: "center",
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#1C1C1C",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardSub: {
    fontSize: 14,
    color: "#AAAAAA",
    marginTop: 6,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hint: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: "#E50914",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
