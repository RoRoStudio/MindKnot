// src/state/useMindMapStore.ts
import { create } from 'zustand';
import { NodeModel } from '../types/NodeTypes';
import {
  getAllNodes,
  insertNode,
  updateNode as updateNodeInDb,
  deleteAllNodes
} from '../services/sqliteService';
import { nanoid } from 'nanoid/non-secure';

// Define the state shape
type MindMapState = {
  nodes: NodeModel[];
  isLoading: boolean;
  pendingUpdates: Record<string, NodeModel>;

  // Data operations
  loadNodes: () => Promise<void>;
  addNode: (partial: Partial<NodeModel>) => Promise<string>;
  updateNode: (node: NodeModel) => Promise<void>;
  updateNodePosition: (id: string, x: number, y: number, commitToDb?: boolean) => Promise<void>;
  batchUpdateNodes: (updates: Record<string, { x: number, y: number }>) => Promise<void>;
  clearAllNodes: () => Promise<void>;
  flushPendingUpdates: () => Promise<void>;
};

// Debounce function to limit database updates
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
};

export const useMindMapStore = create<MindMapState>((set, get) => {
  // Create a debounced function to flush updates to the database
  const debouncedFlush = debounce(async () => {
    const state = get();
    const updates = { ...state.pendingUpdates };
    set({ pendingUpdates: {} });

    // Only make database calls if there are pending updates
    if (Object.keys(updates).length === 0) return;

    try {
      // Process updates in batches to reduce database load
      const updatePromises = Object.values(updates).map(node => updateNodeInDb(node));
      await Promise.all(updatePromises);
      console.log("[MindMapStore] Flushed pending updates to database");
    } catch (error) {
      console.error("[MindMapStore] Error flushing updates:", error);
      // Put failed updates back in the queue
      set(state => ({
        pendingUpdates: { ...state.pendingUpdates, ...updates }
      }));
    }
  }, 500); // 500ms debounce

  return {
    nodes: [],
    isLoading: false,
    pendingUpdates: {},

    loadNodes: async () => {
      try {
        set({ isLoading: true });
        console.log("[MindMapStore] Loading nodes from database...");
        const loadedNodes = await getAllNodes();
        console.log(`[MindMapStore] Loaded ${loadedNodes.length} nodes`);
        set({ nodes: loadedNodes, isLoading: false });
      } catch (error) {
        console.error("[MindMapStore] Error loading nodes:", error);
        set({ nodes: [], isLoading: false });
      }
    },

    addNode: async (partial) => {
      try {
        // Generate an ID and timestamp
        const nodeId = nanoid();
        const now = Date.now();

        // Provide sensible defaults for required fields
        const node: NodeModel = {
          id: nodeId,
          title: partial.title ?? 'Untitled',
          body: partial.body ?? '',
          icon: partial.icon ?? '',
          color: partial.color ?? '#2D9CDB',
          x: partial.x ?? 100,
          y: partial.y ?? 100,
          template: partial.template as any ?? 'quicknote',
          status: partial.status ?? '',
          createdAt: now,
          updatedAt: now,
        };

        // Update state first for immediate feedback
        set((state) => ({ nodes: [...state.nodes, node] }));

        // Then save to database
        await insertNode(node);
        console.log("[MindMapStore] Added node:", nodeId);
        return nodeId;
      } catch (error) {
        console.error("[MindMapStore] Error adding node:", error);
        if (error instanceof Error) {
          console.error("Stack trace:", error.stack);
        }
        return "";
      }
    },

    updateNode: async (updatedNode) => {
      try {
        const now = Date.now();
        const nodeWithTimestamp = { ...updatedNode, updatedAt: now };

        // Update the local state
        set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === updatedNode.id ? nodeWithTimestamp : node
          ),
          // Add to pending updates
          pendingUpdates: {
            ...state.pendingUpdates,
            [updatedNode.id]: nodeWithTimestamp
          }
        }));

        // Trigger the debounced flush
        debouncedFlush();

        console.log("[MindMapStore] Updated node:", updatedNode.id);
      } catch (error) {
        console.error("[MindMapStore] Error updating node:", error);
      }
    },

    updateNodePosition: async (id, x, y, commitToDb = false) => {
      try {
        const now = Date.now();

        // Update the local state
        set((state) => {
          const nodeToUpdate = state.nodes.find(node => node.id === id);

          if (!nodeToUpdate) return state;

          const updatedNode = { ...nodeToUpdate, x, y, updatedAt: now };

          return {
            nodes: state.nodes.map(node =>
              node.id === id ? updatedNode : node
            ),
            // Only add to pending updates if we want to commit to DB
            pendingUpdates: commitToDb
              ? { ...state.pendingUpdates, [id]: updatedNode }
              : state.pendingUpdates
          };
        });

        // Only trigger the flush if we want to commit to DB
        if (commitToDb) {
          debouncedFlush();
        }

        console.log("[MindMapStore] Updated position for node:", id);
      } catch (error) {
        console.error("[MindMapStore] Error updating node position:", error);
      }
    },

    batchUpdateNodes: async (updates) => {
      try {
        const now = Date.now();

        // Update state in a single operation
        set((state) => {
          const pendingUpdates = { ...state.pendingUpdates };
          const updatedNodes = [...state.nodes];

          Object.entries(updates).forEach(([id, { x, y }]) => {
            const index = updatedNodes.findIndex(node => node.id === id);
            if (index >= 0) {
              const updatedNode = {
                ...updatedNodes[index],
                x,
                y,
                updatedAt: now
              };
              updatedNodes[index] = updatedNode;
              pendingUpdates[id] = updatedNode;
            }
          });

          return {
            nodes: updatedNodes,
            pendingUpdates
          };
        });

        // Trigger the debounced flush
        debouncedFlush();

        console.log(`[MindMapStore] Batch updated ${Object.keys(updates).length} nodes`);
      } catch (error) {
        console.error("[MindMapStore] Error batch updating nodes:", error);
      }
    },

    clearAllNodes: async () => {
      try {
        await deleteAllNodes();
        set({ nodes: [], pendingUpdates: {} });
        console.log("[MindMapStore] Cleared all nodes");
      } catch (error) {
        console.error("[MindMapStore] Error clearing nodes:", error);
      }
    },

    flushPendingUpdates: async () => {
      await debouncedFlush();
    }
  };
});