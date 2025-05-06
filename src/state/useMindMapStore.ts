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
        const loaded: NodeModel[] = await getAllNodes();
        set({ nodes: loaded });
    },

    addNode: async (partial) => {
        const now = Date.now();
        const node: NodeModel = {
            id: nanoid(),
            title: partial.title || 'Untitled',
            body: partial.body || '',
            icon: partial.icon || '',
            color: partial.color || '#2D9CDB',
            x: partial.x ?? 0,
            y: partial.y ?? 0,
            template: partial.template || 'quicknote',
            status: partial.status || '',
            createdAt: now,
            updatedAt: now,
        };
        await insertNode(node);
        set((state) => ({ nodes: [...state.nodes, node] }));
    },

    updateNodePosition: async (id, x, y) => {
        const now = Date.now();
        set((state) => {
            const updatedNodes = state.nodes.map((node) =>
                node.id === id ? { ...node, x, y, updatedAt: now } : node
            );
            return { nodes: updatedNodes };
        });

        const updatedNode = get().nodes.find((node) => node.id === id);
        if (updatedNode) {
            await updateNode({ ...updatedNode, x, y, updatedAt: now });
        }
    },

    clearAllNodes: async () => {
        await deleteAllNodes();
        set({ nodes: [] });
    },
}));
