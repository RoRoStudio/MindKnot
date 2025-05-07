// src/components/nodes/NodeCard.tsx

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { DndDraggable } from '@mgcrea/react-native-dnd';
import Animated from 'react-native-reanimated';
import { NodeModel } from '../../types/NodeTypes';

type Props = {
  node: NodeModel;
  size: [number, number];
  color: string;
  onDragEnd: (id: string, x: number, y: number) => void;
};

const NodeCard: React.FC<Props> = ({ node, size, color, onDragEnd }) => {
  const handleDragEnd = (event: { x: number; y: number }) => {
    onDragEnd(node.id, event.x, event.y);
  };

  return (
    <DndDraggable
      id={node.id}
      payload={node}
      onDragEnd={handleDragEnd}
    >
      <Animated.View style={[styles.node, { backgroundColor: color, width: size[0], height: size[1] }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{node.icon || '🔖'}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {node.title || 'Untitled'}
        </Text>
      </Animated.View>
    </DndDraggable>
  );
};

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    position: 'absolute',
    bottom: -18,
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    width: '100%',
  },
});

export default NodeCard;