// ----------------------------
// src/state/sagaStore.ts
// ----------------------------
import { create } from 'zustand';

interface SagaState {
    selectedSagaId: string | null;
    setSelectedSaga: (id: string | null) => void;
}

export const useSagaStore = create<SagaState>((set) => ({
    selectedSagaId: null,
    setSelectedSaga: (id) => set({ selectedSagaId: id }),
}));