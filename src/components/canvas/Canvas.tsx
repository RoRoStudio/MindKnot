// src/components/canvas/Canvas.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import NodeEditor from '../nodes/NodeEditor';
import { NodeModel } from '../../types/NodeTypes';

// Define a consistent node size
const NODE_SIZE: [number, number] = [80, 80];
// Minimum distance between node centers for repulsion
const MIN_DISTANCE = 100;

export default function Canvas() {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);

  // Direct implementation of node repulsion - immediately happening on drag
  const handleDragMove = (id: string, x: number, y: number) => {
    // Find the node being moved
    const movingNode = nodes.find(n => n.id === id);
    if (!movingNode) return;

    // Temporarily update the local position (not in store yet)
    const updatedNode = { ...movingNode, x, y };

    // Check for collisions with other nodes
    let collisions = false;

    // Process each other node for potential repulsion
    nodes.forEach(otherNode => {
      // Skip the node we're moving
      if (otherNode.id === id) return;

      // Calculate distance between nodes
      const dx = x - otherNode.x;
      const dy = y - otherNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If too close, apply repulsion by moving the other node
      if (distance < MIN_DISTANCE) {
        collisions = true;

        // Calculate repulsion direction
        const angle = Math.atan2(dy, dx);

        // Calculate how much the nodes overlap
        const overlap = MIN_DISTANCE - distance;

        // Move the other node away
        const newX = otherNode.x - Math.cos(angle) * overlap * 1.1;
        const newY = otherNode.y - Math.sin(angle) * overlap * 1.1;

        // Update the other node position in the store
        updateNodePosition(otherNode.id, newX, newY);
      }
    });

    // Update the moving node (both to keep in sync and to update the store)
    updateNodePosition(id, x, y);

    return collisions;
  };

  const handleDragStart = (id: string) => {
    setMovingNodeId(id);
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    // Final position update
    updateNodePosition(id, x, y);
    setMovingNodeId(null);
  };

  const handleNodePress = (node: NodeModel) => {
    setSelectedNode(node);
  };

  const handleEditorClose = () => {
    setSelectedNode(null);
  };

  // Spread nodes if they start overlapping
  useEffect(() => {
    // Only run this when nodes change but no node is being moved
    if (movingNodeId || nodes.length < 2) return;

    let hasOverlap = false;
    const nodesCopy = [...nodes];

    // Check each pair of nodes for overlap
    for (let i = 0; i < nodesCopy.length; i++) {
      for (let j = i + 1; j < nodesCopy.length; j++) {
        const nodeA = nodesCopy[i];
        const nodeB = nodesCopy[j];

        // Calculate distance
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If too close, move them apart
        if (distance < MIN_DISTANCE) {
          hasOverlap = true;

          // Calculate movement direction
          const angle = Math.atan2(dy, dx);
          const moveDistance = (MIN_DISTANCE - distance) / 2;

          // Move nodeA away
          nodeA.x += Math.cos(angle) * moveDistance;
          nodeA.y += Math.sin(angle) * moveDistance;

          // Move nodeB away in opposite direction
          nodeB.x -= Math.cos(angle) * moveDistance;
          nodeB.y -= Math.sin(angle) * moveDistance;
        }
      }
    }

    // If we made changes, update all node positions
    if (hasOverlap) {
      nodesCopy.forEach(node => {
        updateNodePosition(node.id, node.x, node.y);
      });
    }
  }, [nodes, movingNodeId, updateNodePosition]);

  return (
    <View style={styles.container}>
      {/* Render all nodes */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          size={NODE_SIZE}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
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