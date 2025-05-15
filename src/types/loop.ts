// src/types/loop.ts
import { BaseEntry } from './baseEntry';

export interface Loop extends BaseEntry {
    type: 'loop';
    description?: string;
    frequency: string; // JSON stringified object, e.g. { type: 'daily' }
    startTimeByDay?: Record<string, string>; // e.g. { mon: '08:00', tue: '09:00' }
    items?: LoopItem[];
}

export interface LoopItem {
    id: string;
    loopId: string;
    name: string;
    description?: string;
    durationMinutes?: number;
    quantity?: string;
    icon?: string;
    actionIds?: string[]; // References to actions
    createdAt: string;
    updatedAt: string;
}