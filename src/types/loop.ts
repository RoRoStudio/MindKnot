// ----------------------------
// src/types/loop.ts
// ----------------------------
export interface Loop {
    id: string;
    title: string;
    description?: string;
    frequency: string; // JSON stringified object, e.g. { type: 'daily' }
    startTimeByDay?: Record<string, string>; // e.g. { mon: '08:00', tue: '09:00' }
    sagaId?: string;
    items?: LoopItem[]; // Add this missing property
    createdAt: string;
    updatedAt: string;
}

export interface LoopItem {
    id: string;
    loopId: string;
    name: string;
    description?: string;
    durationMinutes?: number;
    quantity?: string;
    icon?: string;
    subActions?: { id: string; text: string; done: boolean }[];
    sagaId?: string;
    createdAt: string;
    updatedAt: string;
}
