// src/components/canvas/PanZoomLayer.tsx
import React, { ReactNode, useRef, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDecay,
  runOnJS,
  withSpring,
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
  minScale = 0.1, // Lower to ensure truly infinite feel
  maxScale = 5, // Higher for more detailed zooming
  initialScale = 1,
  onTransformChange,
}: PanZoomLayerProps) {
  // Shared values for transformations
  const scale = useSharedValue(initialScale);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(initialScale);

  // Keep track of focal point for pinch gesture
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Optional callback when transform changes
  const updateTransform = useCallback((newScale: number, newX: number, newY: number) => {
    if (onTransformChange) {
      onTransformChange(newScale, newX, newY);
    }
  }, [onTransformChange]);

  // Pan gesture for moving the canvas
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onUpdate((event) => {
      // Use translationX and translationY instead of changeX and changeY
      translateX.value += event.translationX - (event.translationX > 0 ? event.translationX - 1 : event.translationX + 1);
      translateY.value += event.translationY - (event.translationY > 0 ? event.translationY - 1 : event.translationY + 1);
    })
    .onEnd((event) => {
      // Use decay for a natural stopping motion with momentum
      translateX.value = withDecay({
        velocity: event.velocityX,
        // Remove clamp to allow infinite panning
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        // Remove clamp to allow infinite panning
      });

      if (onTransformChange) {
        runOnJS(updateTransform)(scale.value, translateX.value, translateY.value);
      }
    });

  // Pinch gesture for zooming - improved for better focal point handling
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      savedScale.value = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      // Calculate new scale with constraints
      const newScale = Math.min(
        maxScale,
        Math.max(minScale, savedScale.value * event.scale)
      );

      // Calculate the focal point in the world space
      const worldFocalX = (focalX.value - translateX.value) / scale.value;
      const worldFocalY = (focalY.value - translateY.value) / scale.value;

      // Calculate the new screen space position of the focal point
      const newScreenFocalX = worldFocalX * newScale + translateX.value;
      const newScreenFocalY = worldFocalY * newScale + translateY.value;

      // Adjust translation to keep the focal point at the same screen position
      translateX.value += focalX.value - newScreenFocalX;
      translateY.value += focalY.value - newScreenFocalY;

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
      scale.value = withSpring(initialScale, { damping: 15, stiffness: 200 });
      translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });

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