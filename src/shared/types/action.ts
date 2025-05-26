// src/types/action.ts
import { BaseEntry } from './baseEntry';

export interface SubAction {
    id: string;
    text: string;
    done: boolean;
}

export interface Action extends BaseEntry {
    type: 'action';
    title: string;
    body?: string;
    description: string;
    dueDate?: string;
    done: boolean;
    completed: boolean;
    priority: number;
    subActions?: SubAction[];
    subTasks?: { id: string; text: string; completed: boolean }[];
    parentId?: string; // For hierarchical actions or when part of Path/Loop
    parentType?: 'path' | 'milestone' | 'loop-item'; // Indicates what contains this action
}