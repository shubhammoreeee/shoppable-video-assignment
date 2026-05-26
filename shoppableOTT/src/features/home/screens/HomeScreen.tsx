import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { fetchVideosApi } from '../services/homeApi';
import { VideoType } from '../types/home.types';
import { RootStackParamList } from '../../../app/navigation/types';
import { COLORS } from '../../../theme';
import OTTCard from '../../../components/OTTCard';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { WatchHistory } from '../services/watchHistory';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOP_PAD = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 12;

const HERO_POSTERS = [
  {
    id: 'hero-1',
    title: 'Step To Health 2026',
    subtitle: 'Fitness • Wellbeing • Active Challenge',
    imageUri: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=600&fit=crop',
    description: 'Join the premier Fitness Challenge starting 7th January, 2026. Track steps and win grand prizes!',
    genre: 'Fitness',
    rating: '4.8',
  },
  {
    id: 'hero-2',
    title: 'Heel Touches',
    subtitle: 'Fitness • Wellbeing • Active Challenge',
    imageUri: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800&h=600&fit=crop',
    description: 'Abhishek Tripathi navigates complex village politics, love, and local administration rivalries.',
    genre: 'Drama',
    rating: '4.9',
  },
  {
    id: 'hero-3',
    title: 'Morning Vinyasa Flow',
    subtitle: 'Fitness • Wellbeing • Active Challenge',
    imageUri: 'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&h=600&fit=crop',
    description: 'The throne of Mirzapur remains up for grabs as new fierce rivals and old allies surface in ganglands.',
    genre: 'Thriller',
    rating: '4.7',
  },
];

// Circular virtual list data for seamless rightward loop swiping
const VIRTUAL_HERO_SIZE = 600;
const INITIAL_VIRTUAL_INDEX = 300; // middle of the virtual list

const INFINITE_HERO_POSTERS = Array.from({ length: VIRTUAL_HERO_SIZE }).map((_, index) => {
  const item = HERO_POSTERS[index % HERO_POSTERS.length];
  return {
    ...item,
    uniqueId: `${item.id}-${index}`,
  };
});

const MOCK_METADATA = [
  {
    title: "Heel Touches",
    categoryLabel: "Fitness",
    description: "Strengthen your oblique muscles and core with this simple yet effective workout.",
    imageUri: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop",
  },
  {
    title: "Basics Of Kung-Fu With Warrior Monk Harshh Verma",
    categoryLabel: "Fitness",
    description: "An introduction to the basics of Kung-Fu, focusing on discipline, strength, and agility training.",
    imageUri: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=400&fit=crop",
  },
  {
    title: "Morning Vinyasa Flow",
    categoryLabel: "Wellbeing",
    description: "Start your day with this smooth 10-minute flow to awaken your spine, stretch shoulders, and build core fire.",
    imageUri: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
  },
];

const CATEGORY_TABS = ['All', 'Nutrition', 'Fitness', 'Wellbeing', 'More'];

const HomeScreen = () => {
  const navigation = useNavigation<RootNav>();
  const isFocused = useIsFocused();

  const [fetchedVideos, setFetchedVideos] = useState<VideoType[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Carousel indices
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(INITIAL_VIRTUAL_INDEX);

  const heroListRef = useRef<FlatList>(null);

  const loadVideos = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchVideosApi();
      setFetchedVideos(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load videos';
      setError(msg);
      setFetchedVideos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadVideos(); }, [loadVideos]);

  useEffect(() => {
    if (isFocused) {
      setContinueWatching(WatchHistory.getHistory());
    }
  }, [isFocused]);

  // Scroll to middle of virtual list on mount to support infinite right scrolling
  useEffect(() => {
    if (!loading && fetchedVideos.length > 0) {
      setTimeout(() => {
        heroListRef.current?.scrollToIndex({ index: INITIAL_VIRTUAL_INDEX, animated: false });
      }, 100);
    }
  }, [loading, fetchedVideos.length]);

  // Autoplay Hero Banner Loop - scrolls rightward infinitely
  useEffect(() => {
    if (loading || fetchedVideos.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = virtualIndex + 1;
      setVirtualIndex(nextIndex);
      heroListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveHeroIndex(nextIndex % HERO_POSTERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [virtualIndex, loading, fetchedVideos.length]);

  const onHeroScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index >= 0) {
      setVirtualIndex(index);
      setActiveHeroIndex(index % HERO_POSTERS.length);
    }
  };

  const openPlayer = (videoUrl: string, videoId: string, title?: string) => {
    const parent = navigation.getParent();
    const params = { videoUrl, videoId, title };
    if (parent) parent.navigate('Player', params);
    else navigation.navigate('Player', params);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            <Text style={styles.logoBlack}>FITISTAN </Text>
            <Text style={styles.logoOrange}>VIDEOS</Text>
          </Text>
        </View>
        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
          <SkeletonLoader height={240} width={SCREEN_WIDTH - 40} borderRadius={24} style={{ marginBottom: 24 }} />
          <SkeletonLoader height={120} width={SCREEN_WIDTH - 40} borderRadius={20} style={{ marginBottom: 14 }} />
        </ScrollView>
      </View>
    );
  }

  // Bind dynamic fetched uploads into large-width vertical feed cards
  const videoFeedData = fetchedVideos.map((video, index) => {
    const meta = MOCK_METADATA[index % MOCK_METADATA.length];
    return {
      id: video.id,
      videoUrl: video.videoUrl,
      title: `video ${video.id.substring(0, 7)}`,
      categoryLabel: meta.categoryLabel,
      description: meta.description,
      imageUri: meta.imageUri,
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          <Text style={styles.logoBlack}>FITISTAN </Text>
          <Text style={styles.logoOrange}>VIDEOS</Text>
        </Text>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadVideos(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        data={videoFeedData}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* Category Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
              {CATEGORY_TABS.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.pillText, { color: active ? '#FFF' : COLORS.textSecondary }]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Could not load videos</Text>
                <Text style={styles.errorHint}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => loadVideos()}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Seamless Infinite Autoplay Hero Carousel — cinematic poster style */}
            <View style={styles.heroWrap}>
              <FlatList
                ref={heroListRef}
                data={INFINITE_HERO_POSTERS}
                keyExtractor={item => item.uniqueId}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onHeroScroll}
                getItemLayout={(_, index) => ({
                  length: SCREEN_WIDTH,
                  offset: SCREEN_WIDTH * index,
                  index,
                })}
                renderItem={({ item, index }) => {
                  const picked = fetchedVideos[index % fetchedVideos.length];
                  const videoUrl = picked ? picked.videoUrl : '';
                  const videoId = picked ? picked.id : `hero-${index}`;
                  return (
                    <View style={styles.heroSlideWrap}>
                      <TouchableOpacity
                        activeOpacity={0.95}
                        style={styles.heroSlide}
                        onPress={() => openPlayer(videoUrl, videoId, item.title)}
                      >
                        <Image source={{ uri: item.imageUri }} style={styles.heroImage} resizeMode="cover" />

                        {/* Deep cinematic gradient */}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.88)']}
                          style={styles.heroGradient}
                        />

                        {/* Top genre badge */}
                        <View style={styles.heroBadgeRow}>
                          <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>{item.genre ?? 'FITNESS'}</Text>
                          </View>
                          {/* {item.rating ? (
                            <View style={styles.heroRatingBadge}>
                              <Text style={styles.heroRatingText}>⭐ {item.rating}</Text>
                            </View>
                          ) : null} */}
                        </View>

                        {/* Cinematic content overlay */}
                        <View style={styles.heroContent}>
                          <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                          <Text style={styles.heroTitle}>{item.title}</Text>
                          {/* <Text style={styles.heroDesc} numberOfLines={2}>{item.description}</Text> */}

                          <View style={styles.heroBtnRow}>
                            <View style={styles.watchBtn}>
                              <Text style={styles.watchBtnText}>▶  Watch Now</Text>
                            </View>
                            <View style={styles.moreInfoBtn}>
                              <Text style={styles.moreInfoText}>+ Wishlist</Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />

              {/* Orange pill + line dot indicators */}
              <View style={styles.paginationDots}>
                {HERO_POSTERS.map((_, index) => {
                  const active = index === activeHeroIndex;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        active ? styles.dotActive : styles.dotInactive,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Continue Watching — identical card structure to feed OTTCards */}
            {continueWatching.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Continue Watching" />
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={continueWatching}
                  keyExtractor={item => item.videoId}
                  contentContainerStyle={{ paddingRight: 20 }}
                  renderItem={({ item }) => {
                    const remainingMin = Math.max(1, Math.round((item.duration - item.currentTime) / 60));
                    return (
                      <View style={{ width: 200, marginRight: 14 }}>
                        <OTTCard
                          title={`video ${item.videoId.substring(0, 7)}`}
                          categoryLabel="fitness"
                          description={`${remainingMin} min left`}
                          imageUri={item.imageUri}
                          progress={item.progress}
                          onPress={() => openPlayer(item.videoUrl, item.videoId, item.title)}
                          height={130}
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.feedCardContainer}>
            <OTTCard
              title={item.title}
              categoryLabel={item.categoryLabel}
              description={item.description}
              imageUri={item.imageUri}
              onPress={() => openPlayer(item.videoUrl, item.id, item.title)}
              height={200}
            />
          </View>
        )}
      />
    </View>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: TOP_PAD,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: COLORS.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  logoBlack: {
    color: '#000000',
  },
  logoOrange: {
    color: '#FF7A00',
  },
  pillsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#FF7A00', borderColor: '#FF7A00' },
  pillInactive: { backgroundColor: '#F5F5F5', borderColor: '#EBEBEB' },
  pillText: { fontSize: 13, fontWeight: '700' },
  heroWrap: {
    width: SCREEN_WIDTH,
    height: 264,
    marginBottom: 28,
    position: 'relative',
  },
  heroSlideWrap: {
    width: SCREEN_WIDTH,
    height: 230,
    paddingHorizontal: 16,
  },
  heroSlide: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '30%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF7A00',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
    marginBottom: 8,
  },
  heroBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  watchBtn: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  moreInfoBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  moreInfoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroBadge: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroRatingBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroRatingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    marginRight: 55,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#FF7A00',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  section: { paddingLeft: 20, marginBottom: 10,marginTop: -30,},
  feedCardContainer: {
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  errorBox: { margin: 20, padding: 20, backgroundColor: '#FFF5F5', borderRadius: 16, alignItems: 'center' },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#EB5757', marginBottom: 6 },
  errorHint: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 },
  retryText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
