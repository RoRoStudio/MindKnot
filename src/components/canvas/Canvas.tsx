// src/components/canvas/Canvas.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import { NodeModel } from '../../types/NodeTypes';
import NodeEditor from '../nodes/NodeEditor';
import NodeCard from '../nodes/NodeCard';

interface CanvasProps { }

export default function Canvas(props: CanvasProps) {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);
  const [showControls, setShowControls] = useState(true);

  const handleNodePress = useCallback((node: NodeModel) => {
    console.log('Node pressed:', node.id);
    setSelectedNode(node);
  }, []);

  const handleEditorClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node position callback for the SimpleNodeCard
  const handleNodeMove = useCallback((nodeId: string, newX: number, newY: number) => {
    console.log(`Node ${nodeId} moved to ${newX}, ${newY}`);
    updateNodePosition(nodeId, newX, newY, true);
  }, [updateNodePosition]);

  // Manual movement with button controls
  const moveNode = useCallback((nodeId: string, offsetX: number, offsetY: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      updateNodePosition(
        nodeId,
        node.x + offsetX,
        node.y + offsetY,
        true
      );
    }
  }, [nodes, updateNodePosition]);

  return (
    <View style={styles.container}>
      {/* Render all nodes with our simplified component */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          onNodePress={handleNodePress}
          onNodeMove={handleNodeMove}
        />
      ))}

      {/* Toggle controls button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowControls(!showControls)}
      >
        <Text style={styles.toggleText}>{showControls ? '▼ Hide Controls' : '▲ Show Controls'}</Text>
      </TouchableOpacity>

      {/* Fallback movement controls */}
      {showControls && (
        <View style={styles.controls}>
          {nodes.map(node => (
            <View key={`control-${node.id}`} style={styles.nodeControl}>
              <Text style={styles.nodeTitle}>{node.title}</Text>
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => moveNode(node.id, 0, -50)}
                >
                  <Text>⬆️</Text>
                </TouchableOpacity>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => moveNode(node.id, -50, 0)}
                  >
                    <Text>⬅️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => moveNode(node.id, 50, 0)}
                  >
                    <Text>➡️</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => moveNode(node.id, 0, 50)}
                >
                  <Text>⬇️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

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
  toggleButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 150,
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 8,
    maxHeight: 300,
    zIndex: 100,
    overflow: 'scroll',
  },
  nodeControl: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  controlButtons: {
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 40,
    height: 40,
    margin: 4,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  }
});