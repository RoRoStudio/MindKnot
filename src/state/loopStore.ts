// ----------------------------
// src/state/loopStore.ts
// ----------------------------
import { create } from 'zustand';
import { LoopItem } from '../types/loop';

interface LoopDraft {
    title?: string;
    description?: string;
    frequency?: string;
    startTimeByDay?: Record<string, string>;
    items: LoopItem[];
}

interface LoopState {
    draft: LoopDraft;
    setDraft: (updates: Partial<LoopDraft>) => void;
    resetDraft: () => void;
}

const defaultDraft: LoopDraft = {
    items: [],
};

export const useLoopStore = create<LoopState>((set) => ({
    draft: defaultDraft,
    setDraft: (updates) => set((state) => ({ draft: { ...state.draft, ...updates } })),
    resetDraft: () => set({ draft: defaultDraft }),
}));
