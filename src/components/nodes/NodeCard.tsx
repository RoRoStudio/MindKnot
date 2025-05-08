// src/components/nodes/NodeCard.tsx
import React, { memo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { NodeModel } from '../../types/NodeTypes';
import { Icon } from '../common/Icon';

interface NodeCardProps {
  node: NodeModel;
  onNodePress?: (node: NodeModel) => void;
  onNodeLongPress?: (node: NodeModel) => void;
  onNodeMove?: (id: string, x: number, y: number) => void;
  otherNodes: NodeModel[]; // All other nodes for collision detection
  onNodePush?: (nodeId: string, x: number, y: number) => void; // To push other nodes
  isLinkCreationMode?: boolean; // If true, this node is the source of a link being created
  isLinkTargetMode?: boolean; // If true, this node could be a target for a link
}

const NODE_SIZE = 80; // Width/height of node
const MIN_DISTANCE = 100; // Minimum distance between node centers
const REPULSION_FACTOR = 1.2; // How strongly nodes repel (higher = stronger)
const LONG_PRESS_DURATION = 500; // ms for long press

// Map template types to icon names
const templateToIcon = {
  'quicknote': 'file-text',
  'checklist': 'check-square',
  'bullet': 'list',
  'decision': 'git-branch'
};

function NodeCard({
  node,
  onNodePress,
  onNodeLongPress,
  onNodeMove,
  otherNodes,
  onNodePush,
  isLinkCreationMode,
  isLinkTargetMode
}: NodeCardProps) {
  // Get the appropriate icon name for this node
  const getIconName = () => {
    // If node has an explicit icon defined, use it
    if (node.icon && typeof node.icon === 'string' && node.icon.indexOf('.svg') === -1) {
      return node.icon;
    }

    // Otherwise default to template-based icon
    return templateToIcon[node.template] || 'file-text';
  };

  // Track translations separately from the node's base position
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Track if we're currently dragging
  const isDragging = useSharedValue(false);
  // Track if this was just a tap (not a drag)
  const isTap = useSharedValue(true);
  // Track for long press
  const longPressActive = useSharedValue(false);

  // Current absolute position during drag (node base position + translation)
  const currentX = useDerivedValue(() => node.x + translateX.value);
  const currentY = useDerivedValue(() => node.y + translateY.value);

  // Check for collisions with other nodes
  const checkCollisions = (x: number, y: number) => {
    'worklet';

    for (const otherNode of otherNodes) {
      // Skip self
      if (otherNode.id === node.id) continue;

      // Calculate distance between node centers
      const dx = x - otherNode.x;
      const dy = y - otherNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If nodes are too close
      if (distance < MIN_DISTANCE) {
        // Calculate repulsion vector (normalized)
        const repulsionX = dx / distance;
        const repulsionY = dy / distance;

        // Calculate push distance (how far to push the other node)
        const pushDistance = MIN_DISTANCE - distance;

        // Calculate new position for other node
        const newOtherX = otherNode.x - repulsionX * pushDistance * REPULSION_FACTOR;
        const newOtherY = otherNode.y - repulsionY * pushDistance * REPULSION_FACTOR;

        // Push the other node
        if (onNodePush) {
          runOnJS(onNodePush)(otherNode.id, newOtherX, newOtherY);
        }
      }
    }
  };

  // Only allow dragging if not in link creation mode
  const shouldAllowDragging = !isLinkCreationMode && !isLinkTargetMode;

  // Long press gesture for link creation
  const longPressGesture = Gesture.LongPress()
    .minDuration(LONG_PRESS_DURATION)
    .enabled(!isLinkCreationMode && !isLinkTargetMode) // Only enable if not already in link mode
    .onStart(() => {
      longPressActive.value = true;
    })
    .onEnd(() => {
      if (longPressActive.value && onNodeLongPress) {
        runOnJS(onNodeLongPress)(node);
      }
      longPressActive.value = false;
    });

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .enabled(shouldAllowDragging) // Only allow dragging when not in link mode
    .onBegin(() => {
      isDragging.value = true;
      isTap.value = true;
      longPressActive.value = false; // Cancel long press if drag begins
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;

      // If moved more than a few pixels, it's not a tap
      if (Math.abs(e.translationX) > 3 || Math.abs(e.translationY) > 3) {
        isTap.value = false;
      }

      // Check for collisions while dragging
      checkCollisions(node.x + e.translationX, node.y + e.translationY);
    })
    .onEnd(() => {
      if (isTap.value) {
        // This was just a tap - invoke the press handler
        if (onNodePress) {
          runOnJS(onNodePress)(node);
        }
      } else if (onNodeMove) {
        // This was a drag - update the node position
        const newX = node.x + translateX.value;
        const newY = node.y + translateY.value;

        // Simply update position - no animation needed
        runOnJS(onNodeMove)(node.id, newX, newY);
      }

      // Immediately reset translations - no animation = no bounce
      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
    });

  // Tap gesture for node selection or completing link creation
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (onNodePress) {
        runOnJS(onNodePress)(node);
      }
    });

  // Combine the gestures with priority
  let gesture;
  if (isLinkCreationMode || isLinkTargetMode) {
    // If in link mode, only allow taps
    gesture = tapGesture;
  } else {
    // Normal mode - allow long press and pan
    gesture = Gesture.Exclusive(longPressGesture, panGesture);
  }

  // Animated styles for the node
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ],
      zIndex: isDragging.value ? 999 : 1,
      opacity: isDragging.value ? 0.8 : 1,
      // Add a subtle pulse effect when long press is active
      shadowOpacity: longPressActive.value ? 0.6 : 0.3,
      shadowRadius: longPressActive.value ? 10 : 6,
    };
  });

  // Get the icon name to use
  const iconName = getIconName();

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.nodeContainer,
          {
            left: node.x - NODE_SIZE / 2, // Center horizontally
            top: node.y - NODE_SIZE / 2,  // Center vertically
          },
          isLinkCreationMode && styles.linkSourceNode,
          isLinkTargetMode && styles.linkTargetNode,
          animatedStyle,
        ]}
      >
        {/* Node content */}
        <View style={styles.nodeContent}>
          {/* Use Icon component instead of emoji text */}
          <Icon
            name={iconName as any}
            width={32}
            height={32}
            stroke={node.color}
            strokeWidth={2.5}
          />
        </View>

        {/* Title below the node */}
        <Text style={styles.titleText} numberOfLines={1}>
          {node.title}
        </Text>

        {/* Status badge if present */}
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
    width: NODE_SIZE,
    height: NODE_SIZE + 24, // Add extra height for the title below
    alignItems: 'center',
  },
  nodeContent: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 1.5,
    borderColor: '#333333', // Near-black border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  linkSourceNode: {
    borderColor: '#2D9CDB',
    borderWidth: 3,
    shadowColor: '#2D9CDB',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  linkTargetNode: {
    borderColor: '#6FCF97',
    borderWidth: 2,
    shadowColor: '#6FCF97',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: NODE_SIZE * 1.2,
  },
  statusBadge: {
    position: 'absolute',
    top: -8,
    right: NODE_SIZE / 2 - 24,
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