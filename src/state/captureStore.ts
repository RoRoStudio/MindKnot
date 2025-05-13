// ----------------------------
// src/state/captureStore.ts
// ----------------------------
import { create } from 'zustand';
import { CaptureSubType, SubAction } from '../types/capture';

interface CaptureDraft {
    subType?: CaptureSubType;
    title?: string;
    body?: string;
    mood?: string | number;
    prompt?: string;
    done?: boolean;
    dueDate?: string;
    tags?: string[];
    linkedCaptureIds?: string[];
    subActions?: SubAction[];
}

interface CaptureState {
    draftCapture: CaptureDraft;
    setDraftCapture: (updates: Partial<CaptureDraft>) => void;
    resetDraft: () => void;
}

const initialDraft: CaptureDraft = {
    subType: undefined,
    title: '',
    body: '',
    mood: undefined,
    prompt: '',
    done: false,
    dueDate: '',
    tags: [],
    linkedCaptureIds: [],
    subActions: [],
};

export const useCaptureStore = create<CaptureState>((set) => ({
    draftCapture: initialDraft,
    setDraftCapture: (updates) =>
        set((state) => ({ draftCapture: { ...state.draftCapture, ...updates } })),
    resetDraft: () => set({ draftCapture: initialDraft }),
}));
