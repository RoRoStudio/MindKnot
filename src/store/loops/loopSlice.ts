import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Loop } from '../../types/loop';

interface LoopState {
    draft: Partial<Loop> | null;
    loops: Loop[];
    loading: boolean;
    error: string | null;
}

const initialState: LoopState = {
    draft: null,
    loops: [],
    loading: false,
    error: null
};

const loopSlice = createSlice({
    name: 'loop',
    initialState,
    reducers: {
        setDraft: (state, action: PayloadAction<Partial<Loop> | null>) => {
            state.draft = action.payload;
        },
        resetDraft: (state) => {
            state.draft = null;
        },
        setLoops: (state, action: PayloadAction<Loop[]>) => {
            state.loops = action.payload;
        },
        addLoop: (state, action: PayloadAction<Loop>) => {
            state.loops.push(action.payload);
        },
        updateLoop: (state, action: PayloadAction<Loop>) => {
            const index = state.loops.findIndex(loop => loop.id === action.payload.id);
            if (index !== -1) {
                state.loops[index] = action.payload;
            }
        },
        deleteLoop: (state, action: PayloadAction<string>) => {
            state.loops = state.loops.filter(loop => loop.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setDraft,
    resetDraft,
    setLoops,
    addLoop,
    updateLoop,
    deleteLoop,
    setLoading,
    setError
} = loopSlice.actions;

export default loopSlice.reducer; 