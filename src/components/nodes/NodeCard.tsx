// src/components/nodes/NodeCard.tsx
import React, { memo, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Platform, ViewStyle } from 'react-native';
import { Draggable } from '@mgcrea/react-native-dnd';
import { NodeModel } from '../../types/NodeTypes';
import Animated, { useSharedValue } from 'react-native-reanimated';

interface NodeCardProps {
  node: NodeModel;
  onNodePress?: (node: NodeModel) => void;
  onDragUpdate?: (id: string, x: number, y: number) => void;
}

interface AnimatedStyleOptions {
  isActive: boolean;
  isDisabled: boolean;
  isActing?: boolean;
}

function NodeCard({ node, onNodePress, onDragUpdate }: NodeCardProps) {
  // Track position for live updates
  const nodeX = useSharedValue(node.x);
  const nodeY = useSharedValue(node.y);

  // Update shared values when node changes
  useEffect(() => {
    nodeX.value = node.x;
    nodeY.value = node.y;
  }, [node.x, node.y]);

  const handlePress = () => {
    if (onNodePress) {
      onNodePress(node);
    }
  };

  // Custom animated style with drag effects
  const animatedStyleWorklet = (style: ViewStyle, options: AnimatedStyleOptions) => {
    'worklet';

    const { isActive } = options;

    // Create a new style object to avoid mutations
    const newStyle = { ...style };

    // Add visual effects when node is being dragged
    if (isActive) {
      // Elevate the node while dragging
      if (Platform.OS === 'ios') {
        newStyle.shadowOpacity = 0.4;
        newStyle.shadowRadius = 10;
      } else {
        newStyle.elevation = 10;
      }

      // Ensure it's on top of other nodes
      newStyle.zIndex = 1000;

      // Handle transform property safely
      if (!newStyle.transform) {
        newStyle.transform = [{ scale: 1.1 }];
      } else if (Array.isArray(newStyle.transform)) {
        // Check if scale transform already exists
        const hasScale = newStyle.transform.some(t => 'scale' in t);
        if (!hasScale) {
          // Create a new array with scale added
          newStyle.transform = [...newStyle.transform, { scale: 1.1 }];
        }
      }
      // If transform is a string or other type, leave it unchanged
    }

    return newStyle;
  };

  return (
    <Draggable
      id={node.id}
      data={{
        id: node.id,
        x: node.x,
        y: node.y,
        // Other properties needed for the node
      }}
      style={[
        styles.nodeContainer,
        {
          backgroundColor: node.color,
          // Position using absolute positioning
          left: node.x - 40,
          top: node.y - 40,
        }
      ]}
      animatedStyleWorklet={animatedStyleWorklet}
    >
      <TouchableOpacity
        style={styles.nodeTouchable}
        onPress={handlePress}
        activeOpacity={0.7}
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
      </TouchableOpacity>
    </Draggable>
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