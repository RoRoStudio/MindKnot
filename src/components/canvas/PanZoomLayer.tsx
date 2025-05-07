// src/components/canvas/PanZoomLayer.tsx
import React, { ReactNode, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
} from 'react-native-reanimated';

interface PanZoomLayerProps {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  onTransformChange?: (scale: number, x: number, y: number) => void;
}

function PanZoomLayer({
  children,
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1,
  onTransformChange,
}: PanZoomLayerProps) {
  // Shared values for transformations
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(initialScale);

  // Keep track of last translation values to calculate changes
  const lastTranslationX = useRef(0);
  const lastTranslationY = useRef(0);

  // Optional callback when transform changes
  const updateTransform = (newScale: number, newX: number, newY: number) => {
    if (onTransformChange) {
      onTransformChange(newScale, newX, newY);
    }
  };

  // Pan gesture for moving the canvas
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      // Reset last translation values
      lastTranslationX.current = 0;
      lastTranslationY.current = 0;
    })
    .onUpdate((event) => {
      // Calculate the change in translation since last update
      const deltaX = event.translationX - lastTranslationX.current;
      const deltaY = event.translationY - lastTranslationY.current;

      // Update last translation values
      lastTranslationX.current = event.translationX;
      lastTranslationY.current = event.translationY;

      // Apply delta to current translation values
      translateX.value += deltaX;
      translateY.value += deltaY;
    })
    .onEnd((event) => {
      // Use decay for a natural stopping motion with momentum
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-2000, 2000], // Optional: limit how far it can move
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        clamp: [-2000, 2000],
      });

      if (onTransformChange) {
        runOnJS(updateTransform)(scale.value, translateX.value, translateY.value);
      }

      // Reset last translation values
      lastTranslationX.current = 0;
      lastTranslationY.current = 0;
    });

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      // Calculate new scale with constraints
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, savedScale.value * event.scale)
      );

      scale.value = newScale;
    })
    .onEnd(() => {
      if (onTransformChange) {
        runOnJS(updateTransform)(scale.value, translateX.value, translateY.value);
      }
    });

  // Double tap to reset zoom and position
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = initialScale;
      translateX.value = 0;
      translateY.value = 0;

      if (onTransformChange) {
        runOnJS(updateTransform)(initialScale, 0, 0);
      }
    });

  // Combine gestures
  const composedGestures = Gesture.Simultaneous(
    panGesture,
    Gesture.Exclusive(pinchGesture, doubleTapGesture)
  );

  // Animated style for the pan/zoom container
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PanZoomLayer;