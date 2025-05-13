// ----------------------------
// src/state/pathStore.ts
// ----------------------------
import { create } from 'zustand';
import { Milestone } from '../types/path';

interface PathDraft {
    title?: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
    milestones: Milestone[];
}

interface PathState {
    draft: PathDraft;
    setDraft: (updates: Partial<PathDraft>) => void;
    resetDraft: () => void;
}

const defaultDraft: PathDraft = {
    milestones: [],
};

export const usePathStore = create<PathState>((set) => ({
    draft: defaultDraft,
    setDraft: (updates) => set((state) => ({ draft: { ...state.draft, ...updates } })),
    resetDraft: () => set({ draft: defaultDraft }),
}));