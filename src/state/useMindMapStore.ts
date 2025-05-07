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
  
  // Data operations
  loadNodes: () => Promise<void>;
  addNode: (partial: Partial<NodeModel>) => Promise<string>;
  updateNode: (node: NodeModel) => Promise<void>;
  updateNodePosition: (id: string, x: number, y: number) => Promise<void>;
  clearAllNodes: () => Promise<void>;
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [],
  isLoading: false,

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
      // Update the local state
      set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === updatedNode.id ? { ...updatedNode, updatedAt: Date.now() } : node
        )
      }));
      
      // Then update in database
      await updateNodeInDb(updatedNode);
      console.log("[MindMapStore] Updated node:", updatedNode.id);
    } catch (error) {
      console.error("[MindMapStore] Error updating node:", error);
    }
  },

  updateNodePosition: async (id, x, y) => {
    try {
      const now = Date.now();
      
      // Update the local state
      set((state) => ({
        nodes: state.nodes.map(node => 
          node.id === id ? { ...node, x, y, updatedAt: now } : node
        )
      }));
      
      // Get the node from state and update in database
      const updatedNode = get().nodes.find(node => node.id === id);
      if (updatedNode) {
        await updateNodeInDb({ ...updatedNode, x, y, updatedAt: now });
        console.log("[MindMapStore] Updated position for node:", id);
      }
    } catch (error) {
      console.error("[MindMapStore] Error updating node position:", error);
    }
  },

  clearAllNodes: async () => {
    try {
      await deleteAllNodes();
      set({ nodes: [] });
      console.log("[MindMapStore] Cleared all nodes");
    } catch (error) {
      console.error("[MindMapStore] Error clearing nodes:", error);
    }
  },
}));