// src/components/canvas/Canvas.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, LogBox } from 'react-native';
import { DndProvider } from '@mgcrea/react-native-dnd';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import NodeEditor from '../nodes/NodeEditor';
import { NodeModel } from '../../types/NodeTypes';
import { runOnJS, runOnUI, withTiming } from 'react-native-reanimated';

// Prevent yellow box warnings from flooding logs
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

// Constants for physics
const MIN_NODE_DISTANCE = 100; // Minimum distance between node centers
const REPULSION_STRENGTH = 0.5; // How strongly nodes push each other away

// Global error logger to ensure we don't miss any errors
const logError = (method: string, error: any) => {
  console.error(`ERROR in ${method}:`, error);
  console.error(`ERROR Stack: ${error.stack || 'No stack trace available'}`);

  // Get detailed error info and context
  try {
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  } catch (serializeError) {
    console.error('Error could not be serialized');
  }
};

// Global state tracker - helps identify where crash happens
const updateStateTracker = (action: string, data?: any) => {
  try {
    console.log(`STATE-TRACKER: ${action}`, data ? JSON.stringify(data) : '');
  } catch (e) {
    console.log(`STATE-TRACKER: ${action} (data not serializable)`);
  }
};

// Setup global error handler for Reanimated if possible
try {
  const errorHandler = (workletError: any) => {
    'worklet';
    console.error('WORKLET ERROR:', workletError);
    runOnJS(logError)('worklet', workletError);
  };

  // Fix for the global typing issue - use safer approach
  if (typeof global !== 'undefined' && global._WORKLET) {
    // Use type assertion to bypass TypeScript error
    (global as any).ErrorHandler = errorHandler;
  }
} catch (e) {
  console.log('Could not set up global worklet error handler');
}

// Explicitly define props interface to show Canvas doesn't require any props
interface CanvasProps { }

export default function Canvas(props: CanvasProps) {
  const nodes = useMindMapStore((state) => state.nodes);
  const updateNodePosition = useMindMapStore((state) => state.updateNodePosition);
  const batchUpdateNodes = useMindMapStore((state) => state.batchUpdateNodes);
  const [selectedNode, setSelectedNode] = useState<NodeModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep track of the dragging node ID
  const draggingNodeId = useRef<string | null>(null);

  // Track which operation was last attempted - helps identify crash location
  const lastOperation = useRef<string>('none');

  // Safe wrapper for operations that might fail
  const safeOperation = useCallback((operation: string, callback: () => void) => {
    lastOperation.current = operation;
    updateStateTracker(`Starting: ${operation}`);

    try {
      callback();
      updateStateTracker(`Completed: ${operation}`);
    } catch (error: any) {
      logError(operation, error);
      setErrorMessage(`Error in ${operation}: ${error.message || 'Unknown error'}`);
      updateStateTracker(`Failed: ${operation}`);
    }
  }, []);

  // Apply physics to separate overlapping nodes
  const applyPhysics = useCallback(() => {
    safeOperation('applyPhysics', () => {
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
    });
  }, [nodes, batchUpdateNodes, safeOperation]);

  // Run physics when node count changes
  useEffect(() => {
    updateStateTracker('physics-effect-triggered', { nodesCount: nodes.length });

    const timer = setTimeout(() => {
      applyPhysics();
    }, 300); // Small delay to allow new nodes to settle

    return () => clearTimeout(timer);
  }, [nodes.length, applyPhysics]);

  // Safe wrapper for worklet operations
  const createSafeWorklet = (name: string, func: Function) => {
    return (...args: any[]) => {
      'worklet';
      try {
        updateStateTracker(`Starting worklet: ${name}`);
        const result = func(...args);
        updateStateTracker(`Completed worklet: ${name}`);
        return result;
      } catch (error: any) {
        // First log in worklet context
        console.error(`WORKLET ERROR in ${name}:`, error);

        // Then send to JS thread for more detailed logging
        runOnJS(logError)(name, error);
        runOnJS(setErrorMessage)(`Error in ${name}: ${error.message || 'Unknown error'}`);
        runOnJS(updateStateTracker)(`Failed worklet: ${name}`);
      }
    };
  };

  // Handle drag start to track which node is being dragged
  const handleDragStart = useCallback((event: any, meta: any) => {
    updateStateTracker('drag-start-called', {
      meta: meta ? {
        hasActiveId: !!meta.activeId,
        hasActiveLayout: !!meta.activeLayout
      } : 'null'
    });

    try {
      if (meta && meta.activeId) {
        const nodeId = String(meta.activeId);
        draggingNodeId.current = nodeId;
        console.log('Drag started with node:', nodeId);

        if (meta.activeLayout) {
          console.log('Initial layout:', JSON.stringify(meta.activeLayout));
        } else {
          console.log('WARNING: No layout info in drag start');
        }
      } else {
        console.log('Drag start called with no meta or activeId');
      }
    } catch (error: any) {
      logError('handleDragStart', error);
      setErrorMessage(`Error in drag start: ${error.message || 'Unknown error'}`);
    }
  }, []);

  // Fix for the static modifier issue - use a ref instead
  const firstUpdateLoggedRef = useRef(false);

  // Handle drag updates for live position updates
  const handleDragUpdate = useCallback((event: any, meta: any) => {
    try {
      if (!meta) {
        console.log('Drag update called with no meta data');
        return;
      }

      // Log the first update to see what data structure we're getting
      if (!firstUpdateLoggedRef.current) {
        console.log('First drag update meta:', JSON.stringify(meta, null, 2));
        firstUpdateLoggedRef.current = true;
      }

      if (meta.activeId && meta.activeLayout) {
        const nodeId = String(meta.activeId);

        // Get the active layout info
        const centerX = meta.activeLayout.x + meta.activeLayout.width / 2;
        const centerY = meta.activeLayout.y + meta.activeLayout.height / 2;

        // Update position in the store without saving to database
        runOnJS(updateNodePosition)(nodeId, centerX, centerY, false);
      } else {
        console.log('Drag update missing required data:',
          meta.activeId ? 'Has ID' : 'No ID',
          meta.activeLayout ? 'Has layout' : 'No layout');
      }
    } catch (error: any) {
      logError('handleDragUpdate', error);
      // Don't set error message during update to avoid UI issues
    }
  }, [updateNodePosition]);

  // Debug function to log object properties safely
  const logSafely = (label: string, obj: any) => {
    'worklet';
    try {
      const properties: string[] = [];

      // Try to enumerate top-level properties
      for (const key in obj) {
        try {
          const type = typeof obj[key];
          const isObject = type === 'object' && obj[key] !== null;
          const preview = isObject ? '{...}' : String(obj[key]);
          properties.push(`${key}: (${type}) ${preview}`);
        } catch (e) {
          properties.push(`${key}: [Error getting value]`);
        }
      }

      console.log(`${label}: ${properties.join(', ')}`);
    } catch (error) {
      console.log(`Error logging ${label}:`, error);
    }
  };

  // Handle drag end to save final position and clear dragging state
  const handleDragEnd = createSafeWorklet('handleDragEnd', (params: any) => {
    console.log('Drag end handler called');

    // Log what we received to see the structure
    logSafely('Drag end params', params);

    if (!params) {
      console.log('No params received in drag end');
      runOnJS(setDraggingIdToNull)();
      return;
    }

    const active = params.active;
    const over = params.over;

    logSafely('Active object', active);
    logSafely('Over object', over);

    if (active && active.id) {
      const nodeId = String(active.id);
      console.log('Active node at drag end:', nodeId);

      // Check if layout exists properly
      if (active.layout) {
        logSafely('Active layout', active.layout);

        // Safely access layout properties
        let centerX, centerY;
        try {
          centerX = active.layout.x + active.layout.width / 2;
          centerY = active.layout.y + active.layout.height / 2;
          console.log('Final position:', centerX, centerY);
        } catch (layoutError) {
          console.error('Error calculating position from layout:', layoutError);
          runOnJS(logError)('layout-calculation', layoutError);
          runOnJS(setDraggingIdToNull)();
          return;
        }

        // Update position in the store and save to database
        runOnJS(updateNodePosition)(nodeId, centerX, centerY, true);
        runOnJS(cleanupAfterDrag)(nodeId);
      } else {
        console.log('WARNING: No layout information available at drag end');
        runOnJS(setDraggingIdToNull)();
      }
    } else {
      console.log('No active node at drag end');
      runOnJS(setDraggingIdToNull)();
    }
  });

  // Cleanup functions to ensure state consistency
  const setDraggingIdToNull = useCallback(() => {
    draggingNodeId.current = null;
    updateStateTracker('dragging-id-cleared');
  }, []);

  const cleanupAfterDrag = useCallback((nodeId: string) => {
    console.log('Cleanup after drag for node:', nodeId);
    setDraggingIdToNull();
    // Run physics after drag to adjust other nodes
    setTimeout(applyPhysics, 50);
  }, [applyPhysics, setDraggingIdToNull]);

  const handleNodePress = useCallback((node: NodeModel) => {
    safeOperation('handleNodePress', () => {
      setSelectedNode(node);
    });
  }, [safeOperation]);

  const handleEditorClose = useCallback(() => {
    safeOperation('handleEditorClose', () => {
      setSelectedNode(null);
    });
  }, [safeOperation]);

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Text style={styles.errorSubtext}>Last operation: {lastOperation.current}</Text>
        </View>
      )}

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
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,0,0,0.8)',
    padding: 10,
    zIndex: 2000,
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorSubtext: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  }
});