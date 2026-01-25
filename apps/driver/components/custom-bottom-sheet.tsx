import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  WithSpringConfig,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG: WithSpringConfig = {
  damping: 25,
  stiffness: 300,
  mass: 0.3,
  overshootClamping: true,
};

interface CustomBottomSheetProps {
  children: React.ReactNode;
  snapPoints: number[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  backgroundColor?: string;
  handleColor?: string;
  showHandle?: boolean;
}

export interface CustomBottomSheetRef {
  snapToIndex: (index: number) => void;
}

export const CustomBottomSheet = forwardRef<CustomBottomSheetRef, CustomBottomSheetProps>(
  ({ children, snapPoints, initialIndex = 0, onChange, backgroundColor = '#FFFFFF', handleColor = '#E0E0E0', showHandle = true }, ref) => {
    const snapPositions = snapPoints.map((point) => SCREEN_HEIGHT - point);
    const translateY = useSharedValue(snapPositions[initialIndex]);
    const context = useSharedValue({ y: 0 });
    const activeIndex = useSharedValue(initialIndex);

    const notifyChange = useCallback(
      (index: number) => {
        onChange?.(index);
      },
      [onChange]
    );

    const snapToIndex = useCallback(
      (index: number) => {
        'worklet';
        const clampedIndex = Math.max(0, Math.min(index, snapPositions.length - 1));
        translateY.value = withSpring(snapPositions[clampedIndex], SPRING_CONFIG);
        activeIndex.value = clampedIndex;
        runOnJS(notifyChange)(clampedIndex);
      },
      [snapPositions, notifyChange]
    );

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, snapPositions.length - 1));
        translateY.value = withSpring(snapPositions[clampedIndex], SPRING_CONFIG);
        activeIndex.value = clampedIndex;
        notifyChange(clampedIndex);
      },
    }));

    const gesture = Gesture.Pan()
      .activeOffsetY([-5, 5])
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        translateY.value = Math.max(
          snapPositions[snapPositions.length - 1],
          Math.min(snapPositions[0], context.value.y + event.translationY)
        );
      })
      .onEnd((event) => {
        let closestIndex = 0;
        let minDistance = Math.abs(translateY.value - snapPositions[0]);

        for (let i = 1; i < snapPositions.length; i++) {
          const distance = Math.abs(translateY.value - snapPositions[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = i;
          }
        }

        if (event.velocityY > 200 && closestIndex > 0) {
          closestIndex = closestIndex - 1;
        } else if (event.velocityY < -200 && closestIndex < snapPositions.length - 1) {
          closestIndex = closestIndex + 1;
        }

        translateY.value = withSpring(snapPositions[closestIndex], SPRING_CONFIG);
        activeIndex.value = closestIndex;
        runOnJS(notifyChange)(closestIndex);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, { backgroundColor }, animatedStyle]}>
          {showHandle && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: handleColor }]} />
            </View>
          )}
          <View style={[styles.content, !showHandle && { paddingTop: 16 }]}>{children}</View>
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
});
