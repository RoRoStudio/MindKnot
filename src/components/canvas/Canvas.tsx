// src/components/canvas/Canvas.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import { NodeModel } from '../../types/NodeTypes';
import NodeEditor from '../nodes/NodeEditor';
import NodeCard from '../nodes/NodeCard';
import Animated, { withSpring } from 'react-native-reanimated';

interface CanvasProps { }

export default function Canvas(props: CanvasProps) {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);

  // Handle node selection for editing
  const handleNodePress = useCallback((node: NodeModel) => {
    console.log('Node pressed:', node.id);
    setSelectedNode(node);
  }, []);

  // Close the editor
  const handleEditorClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node position when dragging ends
  const handleNodeMove = useCallback((nodeId: string, newX: number, newY: number) => {
    console.log(`Node ${nodeId} moved to ${newX}, ${newY}`);
    updateNodePosition(nodeId, newX, newY, true);
  }, [updateNodePosition]);

  // Handle pushing another node during collision
  const handleNodePush = useCallback((nodeId: string, newX: number, newY: number) => {
    console.log(`Pushing node ${nodeId} to ${newX}, ${newY}`);
    // Use smooth animation for pushed nodes
    updateNodePosition(nodeId, newX, newY, true);
  }, [updateNodePosition]);

  return (
    <View style={styles.container}>
      {/* Render all nodes */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          onNodePress={handleNodePress}
          onNodeMove={handleNodeMove}
          onNodePush={handleNodePush}
          otherNodes={nodes}
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
  }
});