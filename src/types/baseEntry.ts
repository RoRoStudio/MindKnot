// src/types/baseEntry.ts
export interface BaseEntry {
    id: string;
    title: string;
    tags?: string[];
    categoryId?: string;
    createdAt: string;
    updatedAt: string;
    isStarred?: boolean;
}