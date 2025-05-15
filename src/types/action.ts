// src/types/action.ts
import { BaseEntry } from './baseEntry';

export interface SubAction {
    id: string;
    text: string;
    done: boolean;
}

export interface Action extends BaseEntry {
    type: 'action';
    body: string;
    done: boolean;
    dueDate?: string;
    subActions?: SubAction[];
    parentId?: string; // For hierarchical actions or when part of Path/Loop
    parentType?: 'path' | 'milestone' | 'loop-item'; // Indicates what contains this action
}