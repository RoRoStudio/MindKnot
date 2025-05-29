/**
 * Loop Redux Slice
 * Basic state management for loops with Redux Toolkit
 * 
 * Features:
 * - Basic loop state management
 * - Loading and error states
 * - Integration with useLoops hook
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Loop } from '../../../shared/types/loop';

export interface LoopState {
    /** All loops */
    loops: Loop[];

    /** Loading state */
    isLoading: boolean;

    /** Error message */
    error: string | null;

    /** Currently selected loop */
    selectedLoop: Loop | null;
}

const initialState: LoopState = {
    loops: [],
    isLoading: false,
    error: null,
    selectedLoop: null,
};

/**
 * Loop slice for Redux state management
 */
export const loopSlice = createSlice({
    name: 'loops',
    initialState,
    reducers: {
        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        // Set error state
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },

        // Set all loops
        setLoops: (state, action: PayloadAction<Loop[]>) => {
            state.loops = action.payload;
            state.error = null;
        },

        // Add a new loop
        addLoop: (state, action: PayloadAction<Loop>) => {
            state.loops.push(action.payload);
        },

        // Update an existing loop
        updateLoop: (state, action: PayloadAction<{ id: string; updates: Partial<Loop> }>) => {
            const { id, updates } = action.payload;
            const index = state.loops.findIndex(loop => loop.id === id);
            if (index !== -1) {
                state.loops[index] = { ...state.loops[index], ...updates };
            }
        },

        // Remove a loop
        removeLoop: (state, action: PayloadAction<string>) => {
            state.loops = state.loops.filter(loop => loop.id !== action.payload);
        },

        // Set selected loop
        setSelectedLoop: (state, action: PayloadAction<Loop | null>) => {
            state.selectedLoop = action.payload;
        },

        // Clear all state
        clearLoops: (state) => {
            state.loops = [];
            state.selectedLoop = null;
            state.error = null;
            state.isLoading = false;
        },
    },
});

// Export actions
export const {
    setLoading,
    setError,
    setLoops,
    addLoop,
    updateLoop,
    removeLoop,
    setSelectedLoop,
    clearLoops,
} = loopSlice.actions;

// Export reducer
export default loopSlice.reducer; 