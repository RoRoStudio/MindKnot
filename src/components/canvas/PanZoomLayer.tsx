// src/components/canvas/PanZoomLayer.tsx
import React, { ReactNode, useEffect } from 'react';
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

export default function PanZoomLayer({
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
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const savedScale = useSharedValue(initialScale);
  
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
    .averageTouches(true)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Use decay for a natural stopping motion with momentum
      translateX.value = withDecay({
        velocity: event.velocityX,
        clamp: [-1000, 1000], // Optional: limit how far it can move
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        clamp: [-1000, 1000],
      });
      
      if (onTransformChange) {
        runOnJS(updateTransform)(scale.value, translateX.value, translateY.value);
      }
    });

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      originX.value = 0;
      originY.value = 0;
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      // Calculate new scale with constraints
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, savedScale.value * event.scale)
      );
      
      scale.value = newScale;
      
      // Adjust translation to keep pinch centered at focal point
      if (event.numberOfPointers >= 2) {
        originX.value = event.focalX;
        originY.value = event.focalY;
      }
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