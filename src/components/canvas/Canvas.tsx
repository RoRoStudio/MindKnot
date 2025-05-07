// src/components/canvas/Canvas.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { DndProvider, type ItemOptions } from '@mgcrea/react-native-dnd';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import NodeEditor from '../nodes/NodeEditor';
import { NodeModel } from '../../types/NodeTypes';
import { runOnJS } from 'react-native-reanimated';

// Constants for physics
const MIN_NODE_DISTANCE = 100; // Minimum distance between node centers
const REPULSION_STRENGTH = 0.5; // How strongly nodes push each other away

export default function Canvas() {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const batchUpdateNodes = useMindMapStore((state) => state.batchUpdateNodes);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);

  // Keep track of the dragging node ID
  const draggingNodeId = useRef<string | null>(null);

  // Apply physics to separate overlapping nodes
  const applyPhysics = useCallback(() => {
    if (nodes.length < 2) return;

    // Clone nodes to work with
    const nodesCopy = JSON.parse(JSON.stringify(nodes)) as NodeModel[];
    let hasChanges = false;

    // Check each pair of nodes for potential overlap
    for (let i = 0; i < nodesCopy.length; i++) {
      for (let j = i + 1; j < nodesCopy.length; j++) {
        const nodeA = nodesCopy[i];
        const nodeB = nodesCopy[j];

        // Skip if one of the nodes is being dragged
        if (nodeA.id === draggingNodeId.current || nodeB.id === draggingNodeId.current) {
          continue;
        }

        // Calculate distance between nodes
        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If nodes are too close, push them apart
        if (distance < MIN_NODE_DISTANCE) {
          hasChanges = true;

          // Calculate repulsion direction (normalized vector)
          const angle = Math.atan2(dy, dx);
          const moveDistance = (MIN_NODE_DISTANCE - distance) * REPULSION_STRENGTH;

          // Move nodes apart along the repulsion vector
          const moveX = Math.cos(angle) * moveDistance;
          const moveY = Math.sin(angle) * moveDistance;

          // Update positions (split the movement between both nodes)
          nodeA.x += moveX;
          nodeA.y += moveY;
          nodeB.x -= moveX;
          nodeB.y -= moveY;
        }
      }
    }

    // If changes were made, update the nodes in the store
    if (hasChanges) {
      const updates: Record<string, { x: number, y: number }> = {};
      nodesCopy.forEach(node => {
        updates[node.id] = { x: node.x, y: node.y };
      });

      // Apply the updates
      batchUpdateNodes(updates);
    }
  }, [nodes, batchUpdateNodes]);

  // Run physics when node count changes
  useEffect(() => {
    const timer = setTimeout(() => {
      applyPhysics();
    }, 300); // Small delay to allow new nodes to settle

    return () => clearTimeout(timer);
  }, [nodes.length, applyPhysics]);

  // Handle drag start to track which node is being dragged
  const handleDragStart = useCallback(({ active }: { active: ItemOptions; }) => {
    'worklet';
    if (active && active.id) {
      const nodeId = String(active.id);
      runOnJS(id => { draggingNodeId.current = id; })(nodeId);
    }
  }, []);

  // Handle drag updates for live position updates
  const handleDragUpdate = useCallback(({ active }: { active: ItemOptions; }) => {
    'worklet';
    if (active && active.id) {
      const nodeId = String(active.id);

      // Get the active layout info
      // This uses layout information from the DndProvider
      if (active.layout) {
        const centerX = active.layout.x + active.layout.width / 2;
        const centerY = active.layout.y + active.layout.height / 2;

        // Update position in the store without saving to database
        runOnJS(updateNodePosition)(nodeId, centerX, centerY, false);
      }
    }
  }, [updateNodePosition]);

  // Handle drag end to save final position and clear dragging state
  const handleDragEnd = useCallback(({ active }: { active: ItemOptions; }) => {
    'worklet';
    if (active && active.id) {
      const nodeId = String(active.id);

      // Get the position from the active node's layout
      if (active.layout) {
        const centerX = active.layout.x + active.layout.width / 2;
        const centerY = active.layout.y + active.layout.height / 2;

        // Update position in the store and save to database
        runOnJS(updateNodePosition)(nodeId, centerX, centerY, true);

        // Clear the dragging node ID
        runOnJS(id => {
          draggingNodeId.current = null;
          // Run physics after drag to adjust other nodes
          setTimeout(applyPhysics, 50);
        })(nodeId);
      }
    }
  }, [updateNodePosition, applyPhysics]);

  const handleNodePress = useCallback((node: NodeModel) => {
    setSelectedNode(node);
  }, []);

  const handleEditorClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <View style={styles.container}>
      <DndProvider
        onBegin={handleDragStart}
        onUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
        activationDelay={0}
      >
        {/* Render all nodes */}
        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onNodePress={handleNodePress}
          />
        ))}
      </DndProvider>

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