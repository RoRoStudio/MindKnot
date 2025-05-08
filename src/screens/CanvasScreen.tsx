// src/screens/CanvasScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useMindMapStore } from '../state/useMindMapStore';
import Canvas from '../components/canvas/Canvas';
import PanZoomLayer from '../components/canvas/PanZoomLayer';
import CreateNode from '../components/nodes/CreateNode';
import CanvasToolbar from '../components/canvas/CanvasToolbar';
import { lightTheme } from '../theme/light';

export default function CanvasScreen() {
  const loadNodes = useMindMapStore((s) => s.loadNodes);
  const clearNodes = useMindMapStore((s) => s.clearAllNodes);
  const flushPendingUpdates = useMindMapStore((s) => s.flushPendingUpdates);
  const isLoading = useMindMapStore((s) => s.isLoading);
  const [scale, setScale] = useState(1);
  const [isCreateNodeVisible, setIsCreateNodeVisible] = useState(false);

  // Load nodes when the screen mounts
  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  // Flush pending updates when the component unmounts
  useEffect(() => {
    return () => {
      flushPendingUpdates();
    };
  }, [flushPendingUpdates]);

  // Handle transform changes from the PanZoomLayer
  const handleTransformChange = useCallback((newScale: number, _x: number, _y: number) => {
    setScale(newScale);
  }, []);

  // Show node creation UI
  const handleAddNode = useCallback(() => {
    console.log('Add node button pressed');
    setIsCreateNodeVisible(true);
  }, []);

  // Handle completion of node creation
  const handleNodeCreationComplete = useCallback(() => {
    console.log('Node creation completed');
    setIsCreateNodeVisible(false);
  }, []);

  // Handle clear canvas confirmation
  const handleClearCanvas = useCallback(() => {
    Alert.alert(
      "Clear Canvas",
      "Are you sure you want to delete all nodes and links? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: clearNodes }
      ]
    );
  }, [clearNodes]);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Show loading indicator if data is loading */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={lightTheme.primary} />
          <Text style={styles.loadingText}>Loading your mind map...</Text>
        </View>
      )}

      {/* Main canvas with pan/zoom */}
      <PanZoomLayer
        minScale={0.25}
        maxScale={4}
        onTransformChange={handleTransformChange}
      >
        <Canvas />
      </PanZoomLayer>

      {/* Create node UI - placed above PanZoomLayer but below toolbar */}
      {isCreateNodeVisible && (
        <View style={styles.createNodeContainer}>
          <CreateNode onComplete={handleNodeCreationComplete} />
        </View>
      )}

      {/* Toolbar */}
      <CanvasToolbar
        onAddNode={handleAddNode}
        onClearCanvas={handleClearCanvas}
      />

      {/* Zoom indicator */}
      <View style={styles.zoomIndicator}>
        <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: lightTheme.textPrimary,
  },
  createNodeContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  zoomText: {
    color: lightTheme.textPrimary,
    fontSize: 12,
  },
});