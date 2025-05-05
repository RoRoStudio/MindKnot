import { create } from 'zustand';
import { Node, Link } from '../types/Node';
import { nanoid } from 'nanoid/non-secure';

type NodeStore = {
    nodes: Node[];
    links: Link[];
    addNode: (x: number, y: number) => void;
    updateNodePosition: (id: string, x: number, y: number) => void;
    addLink: (sourceId: string, targetId: string) => void;
};

export const useNodeStore = create<NodeStore>((set) => ({
    nodes: [],
    links: [],
    addNode: (x, y) =>
        set((s) => ({
            nodes: [
                ...s.nodes,
                { id: nanoid(), title: 'New Node', x, y, color: '#2D9CDB' },
            ],
        })),
    updateNodePosition: (id, x, y) =>
        set((s) => ({
            nodes: s.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
        })),
    addLink: (sourceId, targetId) =>
        set((s) => ({
            links: [...s.links, { sourceId, targetId }],
        })),
}));
