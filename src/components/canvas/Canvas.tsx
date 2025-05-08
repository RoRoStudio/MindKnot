// src/components/canvas/Canvas.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder } from 'react-native';
import { useMindMapStore } from '../../state/useMindMapStore';
import { NodeModel } from '../../types/NodeTypes';
import NodeEditor from '../nodes/NodeEditor';
import NodeCard from '../nodes/NodeCard';
import NodeLinks from '../links/NodeLinks';
import LinkTypeSelector from '../links/LinkTypeSelector';

interface CanvasProps { }

export default function Canvas(props: CanvasProps) {
  const nodes = useMindMapStore((state) => state.nodes);
  const links = useMindMapStore((state) => state.links);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const loadLinks = useMindMapStore((state) => state.loadLinks);
  const linkCreationMode = useMindMapStore((state) => state.linkCreationMode);
  const tempLink = useMindMapStore((state) => state.tempLink);
  const startLinkCreation = useMindMapStore((state) => state.startLinkCreation);
  const finishLinkCreation = useMindMapStore((state) => state.finishLinkCreation);
  const cancelLinkCreation = useMindMapStore((state) => state.cancelLinkCreation);
  const selectLinkType = useMindMapStore((state) => state.selectLinkType);

  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);
  const [showLinkModeMessage, setShowLinkModeMessage] = useState(false);
  // Track the mouse position for temporary link
  const [tempLinkTarget, setTempLinkTarget] = useState<{ x: number, y: number } | null>(null);

  // Create a ref to track the source node during link creation
  const sourceNodeRef = useRef<NodeModel | null>(null);
  const [showLinkTypeSelector, setShowLinkTypeSelector] = useState(false);
  const [pendingTargetNodeId, setPendingTargetNodeId] = useState<string | null>(null);

  // Load links on component mount
  useEffect(() => {
    console.log("Loading links...");
    loadLinks();
  }, [loadLinks]);

  // Show message when link creation mode is active
  useEffect(() => {
    if (linkCreationMode) {
      console.log("Link creation mode activated");
      setShowLinkModeMessage(true);
      // Auto-hide the message after a few seconds
      const timer = setTimeout(() => {
        setShowLinkModeMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLinkModeMessage(false);
      setTempLinkTarget(null);
      sourceNodeRef.current = null;
    }
  }, [linkCreationMode]);

  // Set up a pan responder to track mouse movement for the temporary link
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => linkCreationMode,
      onMoveShouldSetPanResponder: () => linkCreationMode,
      onPanResponderMove: (evt, gestureState) => {
        if (linkCreationMode) {
          const { locationX, locationY } = evt.nativeEvent;
          setTempLinkTarget({ x: locationX, y: locationY });
        }
      },
      onPanResponderRelease: () => {
        // Keep the temp link if still in link creation mode
        if (!linkCreationMode) {
          setTempLinkTarget(null);
        }
      },
    })
  ).current;

  // Handle node selection for editing
  const handleNodePress = useCallback((node: NodeModel) => {
    // If in link creation mode, show link type selector
    if (linkCreationMode && tempLink && tempLink.sourceId) {
      if (tempLink.sourceId === node.id) {
        // Cancel if clicking on the source node again
        cancelLinkCreation();
      } else {
        console.log(`Setting up link from ${tempLink.sourceId} to ${node.id}`);
        setPendingTargetNodeId(node.id);
        setShowLinkTypeSelector(true);
      }
    } else {
      console.log('Node pressed:', node.id);
      setSelectedNode(node);
    }
  }, [linkCreationMode, tempLink, cancelLinkCreation]);

  // Handle long press to start link creation
  const handleNodeLongPress = useCallback((node: NodeModel) => {
    console.log('Node long press:', node.id);
    sourceNodeRef.current = node;
    startLinkCreation(node.id);
  }, [startLinkCreation]);

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
    updateNodePosition(nodeId, newX, newY, true);
  }, [updateNodePosition]);

  const handleSelectLinkType = useCallback((type: string) => {
    console.log(`Selected link type: ${type}`);
    if (pendingTargetNodeId) {
      selectLinkType(type);
      finishLinkCreation(pendingTargetNodeId);
      setPendingTargetNodeId(null);
    }
    setShowLinkTypeSelector(false);
  }, [pendingTargetNodeId, selectLinkType, finishLinkCreation]);

  const handleCancelLinkTypeSelection = useCallback(() => {
    setShowLinkTypeSelector(false);
    setPendingTargetNodeId(null);
  }, []);


  // Enhanced tempLink object with coordinates
  const enhancedTempLink = tempLink && tempLink.sourceId
    ? {
      ...tempLink,
      sourceX: sourceNodeRef.current?.x,
      sourceY: sourceNodeRef.current?.y,
      targetX: tempLinkTarget?.x,
      targetY: tempLinkTarget?.y
    }
    : null;

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {/* Links between nodes */}
      <NodeLinks
        links={links}
        nodes={nodes}
        tempLink={enhancedTempLink}
      />

      {/* Render all nodes */}
      {nodes.map((node) => (
        <NodeCard
          key={node.id}
          node={node}
          onNodePress={handleNodePress}
          onNodeMove={handleNodeMove}
          onNodePush={handleNodePush}
          onNodeLongPress={handleNodeLongPress}
          otherNodes={nodes}
          isLinkCreationMode={linkCreationMode && tempLink?.sourceId === node.id}
          isLinkTargetMode={linkCreationMode && tempLink?.sourceId !== node.id}
        />
      ))}

      {/* Link creation mode message */}
      {showLinkModeMessage && (
        <View style={styles.linkModeMessage}>
          <Text style={styles.linkModeText}>
            Tap on another node to create a link
          </Text>
          <TouchableOpacity
            onPress={cancelLinkCreation}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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

      {/* Link type selector */}
      <LinkTypeSelector
        visible={showLinkTypeSelector}
        onSelectType={handleSelectLinkType}
        onCancel={handleCancelLinkTypeSelection}
      />

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
  linkModeMessage: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(45, 156, 219, 0.9)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 900,
  },
  linkModeText: {
    color: 'white',
    flex: 1,
    marginRight: 10,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EB5757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelText: {
    color: 'white',
    fontWeight: '500',
  }
});