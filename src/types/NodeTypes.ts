export type NodeTemplate = 'quicknote' | 'checklist' | 'bullet' | 'decision';

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
    type: 'default' | 'cause' | 'reference' | 'related';
    createdAt: number;
}
