// src/state/useMindMapStore.ts

import { create } from 'zustand';
import { NodeModel } from '../types/NodeTypes';
import { getAllNodes, insertNode, updateNode, deleteAllNodes } from '../services/sqliteService';
import { nanoid } from 'nanoid/non-secure';

type MindMapState = {
  nodes: NodeModel[];
  loadNodes: () => Promise<void>;
  addNode: (partial: Partial<NodeModel>) => Promise<void>;
  updateNodePosition: (id: string, x: number, y: number) => Promise<void>;
  clearAllNodes: () => Promise<void>;
};

export const useMindMapStore = create<MindMapState>((set, get) => ({
  nodes: [],

  loadNodes: async () => {
    try {
      console.log('[MindMapStore] Loading nodes from database...');
      const loaded = await getAllNodes();
      set({ nodes: loaded });
      console.log(`[MindMapStore] Loaded ${loaded.length} nodes`);
    } catch (err) {
      console.error('[MindMapStore] Failed to load nodes:', err);
      set({ nodes: [] });
    }
  },

  addNode: async (partial) => {
    try {
      const now = Date.now();
      const id = nanoid();
      const node: NodeModel = {
        id,
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

      console.log('[MindMapStore] Creating node:', node);
      set((state) => ({ nodes: [...state.nodes, node] }));
      await insertNode(node);
    } catch (err) {
      console.error('[MindMapStore] Failed to add node:', err);
    }
  },

  updateNodePosition: async (id, x, y) => {
    try {
      const now = Date.now();
      const updated = get().nodes.map((n) =>
        n.id === id ? { ...n, x, y, updatedAt: now } : n
      );
      set({ nodes: updated });

      const changed = updated.find((n) => n.id === id);
      if (changed) await updateNode(changed);
    } catch (err) {
      console.error('[MindMapStore] Failed to update position:', err);
    }
  },

  clearAllNodes: async () => {
    try {
      await deleteAllNodes();
      set({ nodes: [] });
    } catch (err) {
      console.error('[MindMapStore] Failed to clear nodes:', err);
    }
  },
}));