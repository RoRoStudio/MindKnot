export interface Node {
    id: string;
    title: string;
    x: number;
    y: number;
    color: string;
}

export interface Link {
    sourceId: string;
    targetId: string;
}
