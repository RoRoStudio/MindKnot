//Paths, milestones, and actions
// ----------------------------
// src/types/path.ts
// ----------------------------
export interface Path {
    id: string;
    title: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
    sagaId?: string;
    milestones?: Milestone[]; // Add this missing property
    createdAt: string;
    updatedAt: string;
}

export interface Milestone {
    id: string;
    pathId: string;
    title: string;
    description?: string;
    actions?: PathAction[]; // Add this missing property
    createdAt: string;
    updatedAt: string;
}

export interface PathAction {
    id: string;
    milestoneId: string;
    name: string;
    description?: string;
    done: boolean;
    dueDate?: string;
    sagaId?: string;
    icon?: string;
    subActions?: { id: string; text: string; done: boolean }[];
    createdAt: string;
    updatedAt: string;
}