// src/types/path.ts
import { BaseEntry } from './baseEntry';

export interface Path extends BaseEntry {
    type: 'path';
    description?: string;
    startDate?: string;
    targetDate?: string;
    milestones?: Milestone[];
}

export interface Milestone {
    id: string;
    pathId: string;
    title: string;
    description?: string;
    actions?: string[]; // Action IDs
    createdAt: string;
    updatedAt: string;
}