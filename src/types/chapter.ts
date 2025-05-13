// ----------------------------
// src/types/chapter.ts
// ----------------------------
export interface Chapter {
    id: string;
    sagaId: string;
    title?: string;
    chapterNumber: number;
    startDate: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}