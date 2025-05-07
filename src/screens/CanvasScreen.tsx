// src/screens/CanvasScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useMindMapStore } from '../state/useMindMapStore';
import Canvas from '../components/canvas/Canvas';
import PanZoomLayer from '../components/canvas/PanZoomLayer';
import CreateNode from '../components/nodes/CreateNode';
import { lightTheme } from '../theme/light';

export default function CanvasScreen() {
  const loadNodes = useMindMapStore((s) => s.loadNodes);
  const clearNodes = useMindMapStore((s) => s.clearAllNodes);
  const isLoading = useMindMapStore((s) => s.isLoading);
  const [scale, setScale] = useState(1);
  
  // Load nodes when the screen mounts
  useEffect(() => {
    loadNodes();
  }, []);
  
  // Handle transform changes from the PanZoomLayer
  const handleTransformChange = (newScale: number, _x: number, _y: number) => {
    setScale(newScale);
  };

  return (
    <View style={styles.container}>
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
        <CreateNode />
      </PanZoomLayer>
      
      {/* UI Controls */}
      <View style={styles.controls}>
        <Pressable 
          style={styles.clearButton} 
          onPress={clearNodes}
        >
          <Text style={styles.clearText}>🗑️ Clear All</Text>
        </Pressable>
        
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{Math.round(scale * 100)}%</Text>
        </View>
      </View>
    </View>
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
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  clearButton: {
    backgroundColor: '#EB5757',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  clearText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  zoomIndicator: {
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