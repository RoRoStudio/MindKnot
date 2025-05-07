// src/components/canvas/Canvas.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import { DndProvider } from '@mgcrea/react-native-dnd';

const NODE_SIZE: [number, number] = [50, 50];

export default function Canvas() {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);

  return (
    <DndProvider>
      <View style={styles.canvasWrapper}>
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            color={node.color}
            size={NODE_SIZE}
            onDragEnd={(id, x, y) => updateNodePosition(id, x, y)}
          />
        ))}
      </View>
    </DndProvider>
  );
}

const styles = StyleSheet.create({
  canvasWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});