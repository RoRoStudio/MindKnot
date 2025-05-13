//Captures (note, spark, action, reflection)
// ----------------------------
// src/types/capture.ts
// ----------------------------
export enum CaptureSubType {
    NOTE = 'note',
    SPARK = 'spark',
    ACTION = 'action',
    REFLECTION = 'reflection',
}

export interface SubAction {
    id: string;
    text: string;
    done: boolean;
}

export interface Capture {
    id: string;
    type: 'capture';
    subType?: CaptureSubType;
    title?: string;
    sagaId?: string;
    chapterId?: string;
    tags?: string[];
    linkedCaptureIds?: string[];

    // Common (optional) content
    body?: string;

    // Only used for subType: REFLECTION
    mood?: string | number; // e.g., emoji or 1–5 scale
    prompt?: string;

    // Only used for subType: ACTION
    done?: boolean;
    dueDate?: string;
    subActions?: SubAction[];

    createdAt: string;
    updatedAt: string;
}