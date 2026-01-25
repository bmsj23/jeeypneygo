import React from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = 100, height = 16, borderRadius = 4, style }: SkeletonProps) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: typeof width === 'number' ? width : width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

export function SkeletonCard({ style, lines = 2, showAvatar = false, showImage = false }: SkeletonCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
      {showImage && <Skeleton width="100%" height={160} borderRadius={12} style={styles.image} />}
      <View style={styles.cardContent}>
        {showAvatar && (
          <View style={styles.avatarRow}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.avatarText}>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={12} style={styles.mt8} />
            </View>
          </View>
        )}
        {!showAvatar && (
          <>
            <Skeleton width="70%" height={16} />
            {lines >= 2 && <Skeleton width="100%" height={14} style={styles.mt8} />}
            {lines >= 3 && <Skeleton width="85%" height={14} style={styles.mt8} />}
          </>
        )}
      </View>
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  cardProps?: SkeletonCardProps;
  style?: ViewStyle;
}

export function SkeletonList({ count = 3, cardProps, style }: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          {...cardProps}
          style={StyleSheet.flatten([styles.listItem, cardProps?.style])}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
  },
  image: {
    marginBottom: 0,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    marginLeft: 12,
    flex: 1,
  },
  mt8: {
    marginTop: 8,
  },
  listItem: {
    marginBottom: 12,
  },
});

export default Skeleton;
