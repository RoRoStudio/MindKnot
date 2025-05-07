// src/components/canvas/Canvas.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import NodeEditor from '../nodes/NodeEditor';
import { NodeModel } from '../../types/NodeTypes';

// Define a consistent node size
const NODE_SIZE: [number, number] = [80, 80];

export default function Canvas() {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);

  const handleDragEnd = (id: string, x: number, y: number) => {
    updateNodePosition(id, x, y);
  };

  const handleNodePress = (node: NodeModel) => {
    setSelectedNode(node);
  };

  const handleEditorClose = () => {
    setSelectedNode(null);
  };

  return (
    <View style={styles.container}>
      {/* Render all nodes */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          size={NODE_SIZE}
          onDragEnd={handleDragEnd}
          onNodePress={handleNodePress}
        />
      ))}

      {/* Node editor modal */}
      {selectedNode && (
        <View style={styles.editorOverlay}>
          <NodeEditor 
            node={selectedNode} 
            onClose={handleEditorClose} 
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  editorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});