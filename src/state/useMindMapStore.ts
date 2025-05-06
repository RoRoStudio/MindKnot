import { create } from 'zustand';
import { StateCreator } from 'zustand';
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

// Define a more specific type for the store creator
type MindMapStoreCreator = StateCreator<MindMapState>;

export const useMindMapStore = create<MindMapState>((set, get) => ({
    nodes: [],

    loadNodes: async () => {
        try {
            console.log("Loading nodes from database...");
            const loaded: NodeModel[] = await getAllNodes();
            set({ nodes: loaded });
            console.log(`Loaded ${loaded.length} nodes`);
        } catch (error) {
            console.error('Error loading nodes:', error);
            set({ nodes: [] });
        }
    },

    addNode: async (partial) => {
        try {
            // Generate ID first to ensure it's valid
            const nodeId = nanoid();
            console.log("Generated node ID:", nodeId);

            // Log the partial data we received
            console.log("Adding new node with properties:", JSON.stringify(partial));

            const now = Date.now();

            // Create node with defaults for any missing properties
            const node: NodeModel = {
                id: nodeId,
                title: partial.title ?? 'Untitled',
                body: partial.body ?? '',
                icon: partial.icon ?? '',
                color: partial.color ?? '#2D9CDB',
                x: partial.x ?? 100, // Use nullish coalescing to handle 0 correctly
                y: partial.y ?? 100, // Use nullish coalescing to handle 0 correctly
                template: (partial.template as any) ?? 'quicknote',
                status: partial.status ?? '',
                createdAt: now,
                updatedAt: now,
            };

            console.log("Created full node object:", JSON.stringify(node));

            // Update state first for immediate feedback
            set((state) => {
                const newNodes = [...state.nodes, node];
                console.log(`Updated state, now have ${newNodes.length} nodes`);
                return { nodes: newNodes };
            });

            // Then save to database
            const success = await insertNode(node);
            if (!success) {
                console.warn("Database insertion failed, but state was updated");
            }
        } catch (error) {
            console.error('Error adding node:', error);
            // Include stack trace for debugging
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
        }
    },

    updateNodePosition: async (id, x, y) => {
        try {
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
        } catch (error) {
            console.error('Error updating node position:', error);
        }
    },

    clearAllNodes: async () => {
        try {
            await deleteAllNodes();
            set({ nodes: [] });
        } catch (error) {
            console.error('Error clearing nodes:', error);
        }
    },
}));