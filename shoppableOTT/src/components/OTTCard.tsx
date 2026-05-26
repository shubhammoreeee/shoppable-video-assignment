import React, { memo } from 'react';
import {
  Text,
  StyleSheet,
  Image,
  View,
  DimensionValue,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  categoryLabel?: string;
  imageUri?: string;
  progress?: number;
  durationLabel?: string;
  isShoppable?: boolean;
  onPress: () => void;
  width?: DimensionValue;
  height?: number;
}

const OTTCard = memo(({
  title,
  subtitle,
  description,
  categoryLabel = "FITNESS",
  imageUri,
  progress,
  durationLabel,
  isShoppable,
  onPress,
  width = '100%',
  height = 180,
}: Props) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: width as any, marginBottom: 20 }]}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.thumb, { height }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.thumbFallback]} />
          )}

          {isShoppable && (
            <View style={styles.shoppableBadge}>
              <Text style={styles.shoppableBadgeText}>SHOP</Text>
            </View>
          )}

          {progress !== undefined && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabel.toUpperCase()}</Text>
          </View>
          
          <Text style={styles.title}>{title}</Text>
          
          {(description || subtitle) ? (
            <Text style={styles.description} numberOfLines={2}>
              {description ?? subtitle}
            </Text>
          ) : null}

          {durationLabel ? (
            <Text style={styles.duration}>{durationLabel}</Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
});

OTTCard.displayName = 'OTTCard';

export default OTTCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
  },
  thumb: {
    width: '100%',
    backgroundColor: '#EAEAEA',
  },
  thumbFallback: {
    backgroundColor: '#F0F0F0',
  },
  shoppableBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shoppableBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#FF7A00',
  },
  content: {
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  categoryBadge: {
    backgroundColor: '#FFF0E5',
    borderColor: 'rgba(255,122,0,0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  categoryText: {
    color: '#FF7A00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
    lineHeight: 24,
    marginBottom: 3,
  },
  description: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 18,
  },
  duration: {
    fontSize: 12,
    color: '#FF7A00',
    fontWeight: '700',
    marginTop: 6,
  },
});
