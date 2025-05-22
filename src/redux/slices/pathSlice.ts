import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Milestone } from '../../types/path';

interface PathDraft {
    title?: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
    milestones: Milestone[];
}

interface PathState {
    draft: PathDraft;
}

const defaultDraft: PathDraft = {
    milestones: [],
};

const initialState: PathState = {
    draft: defaultDraft,
};

export const pathSlice = createSlice({
    name: 'path',
    initialState,
    reducers: {
        setDraft: (state, action: PayloadAction<Partial<PathDraft>>) => {
            state.draft = { ...state.draft, ...action.payload };
        },
        resetDraft: (state) => {
            state.draft = defaultDraft;
        },
    },
});

export const { setDraft, resetDraft } = pathSlice.actions;

export default pathSlice.reducer; 