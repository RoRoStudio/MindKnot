// src/components/nodes/NodeCard.tsx
import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { NodeModel } from '../../types/NodeTypes';
import { spacing, typography } from '../../styles';

interface NodeCardProps {
  node: NodeModel;
  size: [number, number]; // [width, height]
  onDragEnd: (id: string, x: number, y: number) => void;
  onNodePress?: (node: NodeModel) => void;
}

const NODE_SPRING_CONFIG = {
  damping: 15,
  stiffness: 100,
};

const NodeCard: React.FC<NodeCardProps> = ({ 
  node, 
  size, 
  onDragEnd,
  onNodePress,
}) => {
  // Create shared values for position
  const translateX = useSharedValue(node.x);
  const translateY = useSharedValue(node.y);
  const scale = useSharedValue(1);
  
  // Update shared values when node position changes in store
  useEffect(() => {
    if (node.x !== translateX.value || node.y !== translateY.value) {
      translateX.value = withSpring(node.x, NODE_SPRING_CONFIG);
      translateY.value = withSpring(node.y, NODE_SPRING_CONFIG);
    }
  }, [node.x, node.y]);

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Scale up slightly when dragging begins
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = node.x + event.translationX;
      translateY.value = node.y + event.translationY;
    })
    .onEnd(() => {
      // Animate scale back to normal
      scale.value = withSpring(1);
      
      // Update the store with the final position
      runOnJS(onDragEnd)(node.id, translateX.value, translateY.value);
    });

  // Tap gesture
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onNodePress) {
        runOnJS(onNodePress)(node);
      }
    });

  // Combine gestures
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
};

const styles = StyleSheet.create({
  nodeContainer: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s,
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
    fontSize: typography.fontSize.s,
    fontWeight: typography.fontWeight.medium,
    color: '#1A1A1A',
    textAlign: 'center',
    width: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
  },
});

export default NodeCard;