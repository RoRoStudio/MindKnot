// src/types/path.ts
import { BaseEntry } from './baseEntry';

export interface Path extends BaseEntry {
    type: 'path';
    description?: string;
    startDate?: string;
    targetDate?: string;
    target?: string; // The goal or target outcome
    expectedDuration?: string; // Expected time to complete
    milestones?: Milestone[];
    // Remove the actions array - actions will be linked via parentId/parentType
}

export interface Milestone {
    id: string;
    pathId: string;
    title: string;
    description?: string;
    order: number; // For drag-and-drop reordering
    collapsed?: boolean; // For UI state
    createdAt: string;
    updatedAt: string;
}

// Utility type for action references in path context
export interface PathActionReference {
    id: string;
    actionId: string; // Reference to the actual Action
    isLinked: boolean; // Whether this is a linked existing action or path-specific
    order: number; // For reordering within milestone or ungrouped
    milestoneId?: string; // If part of a milestone, otherwise ungrouped
}