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
    actions?: Array<{
        id: string;
        title: string;
        description?: string;
        done: boolean;
        milestone?: string;
    }>;
}

export interface Milestone {
    id: string;
    pathId: string;
    title: string;
    description?: string;
    actions?: Array<{
        id: string;
        name: string;
        description?: string;
        done: boolean
    }>;
    createdAt: string;
    updatedAt: string;
}