import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoopItem } from '../../types/loop';

interface LoopDraft {
    title?: string;
    description?: string;
    frequency?: string;
    startTimeByDay?: Record<string, string>;
    items: LoopItem[];
}

interface LoopState {
    draft: LoopDraft;
}

const defaultDraft: LoopDraft = {
    items: [],
};

const initialState: LoopState = {
    draft: defaultDraft,
};

export const loopSlice = createSlice({
    name: 'loop',
    initialState,
    reducers: {
        setDraft: (state, action: PayloadAction<Partial<LoopDraft>>) => {
            state.draft = { ...state.draft, ...action.payload };
        },
        resetDraft: (state) => {
            state.draft = defaultDraft;
        },
    },
});

export const { setDraft, resetDraft } = loopSlice.actions;

export default loopSlice.reducer; 