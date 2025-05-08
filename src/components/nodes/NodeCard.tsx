// src/components/nodes/NodeCard.tsx
import React, { memo, useEffect } from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { NodeModel } from '../../types/NodeTypes';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';

interface NodeCardProps {
  node: NodeModel;
  onNodePress?: (node: NodeModel) => void;
  onDragUpdate?: (id: string, x: number, y: number) => void;
}

function NodeCard({ node, onNodePress, onDragUpdate }: NodeCardProps) {
  // Track translation during drag
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Reset translations when node position changes from outside
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [node.x, node.y]);

  // Track if we're currently dragging (to distinguish press from drag)
  const isDragging = useSharedValue(false);

  // Handle node position updates
  const updateNodePosition = (x: number, y: number, save: boolean = false) => {
    if (onDragUpdate) {
      console.log(`Updating node ${node.id} position to ${x}, ${y}, save: ${save}`);
      onDragUpdate(node.id, x, y);
    }
  };

  // Gesture handler for dragging
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      isDragging.value = false;
    },
    onActive: (event) => {
      // Update translation
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // If moved more than 5px, consider it a drag
      if (Math.abs(event.translationX) > 5 || Math.abs(event.translationY) > 5) {
        isDragging.value = true;
      }

      // Update position during drag (but don't save to DB yet)
      if (isDragging.value) {
        const newX = node.x + event.translationX;
        const newY = node.y + event.translationY;
        runOnJS(updateNodePosition)(newX, newY, false);
      }
    },
    onEnd: (event) => {
      // Calculate final position
      const finalX = node.x + event.translationX;
      const finalY = node.y + event.translationY;

      // If it was a drag, update the final position
      if (isDragging.value) {
        // Save final position to database
        runOnJS(updateNodePosition)(finalX, finalY, true);
      } else {
        // It was a tap
        if (onNodePress) {
          runOnJS(onNodePress)(node);
        }
      }

      // Reset translations
      translateX.value = 0;
      translateY.value = 0;
    },
  });

  // Animated style for dragging
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          styles.nodeContainer,
          {
            backgroundColor: node.color,
            left: node.x - 40, // Center horizontally
            top: node.y - 40,  // Center vertically
          },
          animatedStyle,
        ]}
      >
        <View style={styles.nodeTouchable}>
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
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nodeTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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

export default memo(NodeCard);