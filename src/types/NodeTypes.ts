// src/types/NodeTypes.ts (update)
export type NodeTemplate = 'quicknote' | 'checklist' | 'bullet' | 'decision';

export type LinkStyle = 'solid' | 'dashed' | 'dotted';
export type LinkType = 'default' | 'cause' | 'reference' | 'related';

export interface NodeModel {
    id: string;
    title: string;
    body?: string;
    icon?: string;
    color: string;
    x: number;
    y: number;
    template: NodeTemplate;
    status?: string;
    createdAt: number;
    updatedAt: number;
}

export interface LinkModel {
    id: string;
    sourceId: string;
    targetId: string;
    label?: string;
    color?: string;
    style?: LinkStyle;
    type: LinkType;
    createdAt: number;
    updatedAt?: number;
}