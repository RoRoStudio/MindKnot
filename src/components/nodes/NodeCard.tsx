// src/components/nodes/NodeCard.tsx
import React, { useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { NodeModel } from '../../types/NodeTypes';

interface NodeCardProps {
  node: NodeModel;
  size: [number, number]; // [width, height]
  onDragStart?: (id: string) => void;
  onDragMove?: (id: string, x: number, y: number) => boolean | void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onNodePress?: (node: NodeModel) => void;
}

// Spring configuration for smooth movement
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 0.8,
  overshootClamping: false,
};

function NodeCard({
  node,
  size,
  onDragStart,
  onDragMove,
  onDragEnd,
  onNodePress,
}: NodeCardProps) {
  // Create shared values for position
  const translateX = useSharedValue(node.x);
  const translateY = useSharedValue(node.y);
  const scale = useSharedValue(1);

  // Update shared values when node position changes in store
  useEffect(() => {
    translateX.value = withSpring(node.x, SPRING_CONFIG);
    translateY.value = withSpring(node.y, SPRING_CONFIG);
  }, [node.x, node.y]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Scale up slightly when dragging begins
      scale.value = withSpring(1.1, { damping: 15, stiffness: 200 });

      // Notify parent that dragging has started
      if (onDragStart) {
        runOnJS(onDragStart)(node.id);
      }
    })
    .onUpdate((event) => {
      // Calculate new position
      const newX = node.x + event.translationX;
      const newY = node.y + event.translationY;

      // Update immediately for visual feedback
      translateX.value = newX;
      translateY.value = newY;

      // Notify parent of movement (for repulsion)
      if (onDragMove) {
        runOnJS(onDragMove)(node.id, newX, newY);
      }
    })
    .onEnd((event) => {
      // Calculate final position
      const finalX = node.x + event.translationX;
      const finalY = node.y + event.translationY;

      // Animate scale back to normal
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });

      // Update the store with the final position
      runOnJS(onDragEnd)(node.id, finalX, finalY);
    });

  // Tap gesture for selecting a node
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onNodePress) {
        runOnJS(onNodePress)(node);
      }
    });

  // Combine gestures with priority
  const gesture = Gesture.Exclusive(panGesture, tapGesture);

  // Animated style for the node
  const nodeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.nodeContainer,
          { backgroundColor: node.color, width: size[0], height: size[1] },
          nodeStyle
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{node.icon || '📝'}</Text>
        </View>
        <Text style={styles.titleText} numberOfLines={1}>
          {node.title}
        </Text>
        {node.status ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{node.status}</Text>
          </View>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
  },
  titleText: {
    position: 'absolute',
    bottom: -24,
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    width: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
  },
});

export default NodeCard;