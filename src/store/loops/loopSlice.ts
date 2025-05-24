import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Loop, ActivityTemplate, LoopActivity, LoopExecutionState, ActivityExecutionResult } from '../../types/loop';
import {
    getAllLoops,
    createLoop,
    updateLoop,
    deleteLoop,
    getAllActivityTemplates,
    createActivityTemplate,
    updateActivityTemplate,
    deleteActivityTemplate,
    getLoopActivities,
    createLoopActivity,
    updateLoopActivity,
    deleteLoopActivity,
    reorderLoopActivities,
    startLoopExecution,
    completeLoopExecution,
    pauseLoopExecution,
    advanceLoopActivity,
    getActiveLoopExecution,
    initializePredefinedActivityTemplates
} from '../../api/loopService';

interface LoopState {
    // Loops data
    loops: Loop[];
    currentLoop: Loop | null;

    // Activity templates
    activityTemplates: ActivityTemplate[];

    // Execution state
    activeExecution: {
        loop: Loop;
        executionState: LoopExecutionState;
    } | null;

    // UI state
    loading: boolean;
    error: string | null;

    // Draft state for creation/editing
    draft: Partial<Loop> | null;
}

const initialState: LoopState = {
    loops: [],
    currentLoop: null,
    activityTemplates: [],
    activeExecution: null,
    loading: false,
    error: null,
    draft: null
};

// =====================
// ASYNC THUNKS
// =====================

// Loop operations
export const fetchLoops = createAsyncThunk(
    'loops/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllLoops();
        } catch (error) {
            console.error('Failed to load loops:', error);
            return rejectWithValue('Failed to load loops');
        }
    }
);

export const addLoop = createAsyncThunk(
    'loops/add',
    async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await createLoop(loop);
        } catch (error) {
            console.error('Failed to create loop:', error);
            return rejectWithValue('Failed to create loop');
        }
    }
);

export const updateLoopThunk = createAsyncThunk(
    'loops/update',
    async ({ id, updates }: { id: string; updates: Partial<Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
        try {
            const success = await updateLoop(id, updates as any);
            if (success) {
                return { id, updates };
            }
            return rejectWithValue('Failed to update loop');
        } catch (error) {
            console.error('Failed to update loop:', error);
            return rejectWithValue('Failed to update loop');
        }
    }
);

export const removeLoop = createAsyncThunk(
    'loops/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            const success = await deleteLoop(id);
            if (success) {
                return id;
            }
            return rejectWithValue('Failed to delete loop');
        } catch (error) {
            console.error('Failed to delete loop:', error);
            return rejectWithValue('Failed to delete loop');
        }
    }
);

// Activity template operations
export const fetchActivityTemplates = createAsyncThunk(
    'loops/fetchActivityTemplates',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllActivityTemplates();
        } catch (error) {
            console.error('Failed to load activity templates:', error);
            return rejectWithValue('Failed to load activity templates');
        }
    }
);

export const addActivityTemplate = createAsyncThunk(
    'loops/addActivityTemplate',
    async (template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await createActivityTemplate(template);
        } catch (error) {
            console.error('Failed to create activity template:', error);
            return rejectWithValue('Failed to create activity template');
        }
    }
);

export const updateActivityTemplateThunk = createAsyncThunk(
    'loops/updateActivityTemplate',
    async ({ id, updates }: { id: string; updates: Partial<Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
        try {
            const success = await updateActivityTemplate(id, updates);
            if (success) {
                return { id, updates };
            }
            return rejectWithValue('Failed to update activity template');
        } catch (error) {
            console.error('Failed to update activity template:', error);
            return rejectWithValue('Failed to update activity template');
        }
    }
);

export const removeActivityTemplate = createAsyncThunk(
    'loops/removeActivityTemplate',
    async (id: string, { rejectWithValue }) => {
        try {
            const success = await deleteActivityTemplate(id);
            if (success) {
                return id;
            }
            return rejectWithValue('Failed to delete activity template');
        } catch (error) {
            console.error('Failed to delete activity template:', error);
            return rejectWithValue('Failed to delete activity template');
        }
    }
);

// Loop execution operations
export const startLoopExecutionThunk = createAsyncThunk(
    'loops/startExecution',
    async (loopId: string, { rejectWithValue }) => {
        try {
            const success = await startLoopExecution(loopId);
            if (success) {
                const activeExecution = await getActiveLoopExecution();
                return activeExecution;
            }
            return rejectWithValue('Failed to start loop execution');
        } catch (error) {
            console.error('Failed to start loop execution:', error);
            return rejectWithValue('Failed to start loop execution');
        }
    }
);

export const completeLoopExecutionThunk = createAsyncThunk(
    'loops/completeExecution',
    async (loopId: string, { rejectWithValue }) => {
        try {
            const success = await completeLoopExecution(loopId);
            if (success) {
                return loopId;
            }
            return rejectWithValue('Failed to complete loop execution');
        } catch (error) {
            console.error('Failed to complete loop execution:', error);
            return rejectWithValue('Failed to complete loop execution');
        }
    }
);

export const pauseLoopExecutionThunk = createAsyncThunk(
    'loops/pauseExecution',
    async ({ loopId, isPaused }: { loopId: string; isPaused: boolean }, { rejectWithValue }) => {
        try {
            const success = await pauseLoopExecution(loopId, isPaused);
            if (success) {
                const activeExecution = await getActiveLoopExecution();
                return activeExecution;
            }
            return rejectWithValue('Failed to pause/resume loop execution');
        } catch (error) {
            console.error('Failed to pause/resume loop execution:', error);
            return rejectWithValue('Failed to pause/resume loop execution');
        }
    }
);

export const advanceLoopActivityThunk = createAsyncThunk(
    'loops/advanceActivity',
    async ({ loopId, activityResult }: { loopId: string; activityResult: ActivityExecutionResult }, { rejectWithValue }) => {
        try {
            const success = await advanceLoopActivity(loopId, activityResult);
            if (success) {
                const activeExecution = await getActiveLoopExecution();
                return activeExecution;
            }
            return rejectWithValue('Failed to advance loop activity');
        } catch (error) {
            console.error('Failed to advance loop activity:', error);
            return rejectWithValue('Failed to advance loop activity');
        }
    }
);

export const fetchActiveExecution = createAsyncThunk(
    'loops/fetchActiveExecution',
    async (_, { rejectWithValue }) => {
        try {
            return await getActiveLoopExecution();
        } catch (error) {
            console.error('Failed to fetch active execution:', error);
            return rejectWithValue('Failed to fetch active execution');
        }
    }
);

export const initializePredefinedTemplates = createAsyncThunk(
    'loops/initializePredefinedTemplates',
    async (_, { rejectWithValue }) => {
        try {
            await initializePredefinedActivityTemplates();
            return await getAllActivityTemplates();
        } catch (error) {
            console.error('Failed to initialize predefined templates:', error);
            return rejectWithValue('Failed to initialize predefined templates');
        }
    }
);

// =====================
// SLICE
// =====================

const loopSlice = createSlice({
    name: 'loop',
    initialState,
    reducers: {
        // Draft management
        setDraft: (state, action: PayloadAction<Partial<Loop> | null>) => {
            state.draft = action.payload;
        },
        resetDraft: (state) => {
            state.draft = null;
        },
        updateDraft: (state, action: PayloadAction<Partial<Loop>>) => {
            if (state.draft) {
                state.draft = { ...state.draft, ...action.payload };
            } else {
                state.draft = action.payload;
            }
        },

        // Current loop management
        setCurrentLoop: (state, action: PayloadAction<Loop | null>) => {
            state.currentLoop = action.payload;
        },

        // Direct state updates
        setLoops: (state, action: PayloadAction<Loop[]>) => {
            state.loops = action.payload;
        },
        setActivityTemplates: (state, action: PayloadAction<ActivityTemplate[]>) => {
            state.activityTemplates = action.payload;
        },
        setActiveExecution: (state, action: PayloadAction<{ loop: Loop; executionState: LoopExecutionState } | null>) => {
            state.activeExecution = action.payload;
        },

        // Error management
        clearError: (state) => {
            state.error = null;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },

        // Loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch loops
            .addCase(fetchLoops.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoops.fulfilled, (state, action) => {
                state.loops = action.payload;
                state.loading = false;
            })
            .addCase(fetchLoops.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Add loop
            .addCase(addLoop.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addLoop.fulfilled, (state, action) => {
                state.loops.unshift(action.payload);
                state.loading = false;
                state.draft = null; // Clear draft after successful creation
            })
            .addCase(addLoop.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update loop
            .addCase(updateLoopThunk.fulfilled, (state, action) => {
                const { id, updates } = action.payload as { id: string; updates: Partial<Loop> };
                state.loops = state.loops.map(loop =>
                    loop.id === id ? { ...loop, ...updates } : loop
                );
                if (state.currentLoop?.id === id) {
                    state.currentLoop = { ...state.currentLoop, ...updates };
                }
            })

            // Remove loop
            .addCase(removeLoop.fulfilled, (state, action) => {
                state.loops = state.loops.filter(loop => loop.id !== action.payload);
                if (state.currentLoop?.id === action.payload) {
                    state.currentLoop = null;
                }
            })

            // Activity templates
            .addCase(fetchActivityTemplates.fulfilled, (state, action) => {
                state.activityTemplates = action.payload;
            })
            .addCase(addActivityTemplate.fulfilled, (state, action) => {
                state.activityTemplates.push(action.payload);
            })
            .addCase(updateActivityTemplateThunk.fulfilled, (state, action) => {
                const { id, updates } = action.payload as { id: string; updates: Partial<ActivityTemplate> };
                state.activityTemplates = state.activityTemplates.map(template =>
                    template.id === id ? { ...template, ...updates } : template
                );
            })
            .addCase(removeActivityTemplate.fulfilled, (state, action) => {
                state.activityTemplates = state.activityTemplates.filter(template => template.id !== action.payload);
            })

            // Loop execution
            .addCase(startLoopExecutionThunk.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
                // Update the loop in the loops array
                if (action.payload) {
                    state.loops = state.loops.map(loop =>
                        loop.id === action.payload!.loop.id ? action.payload!.loop : loop
                    );
                }
            })
            .addCase(completeLoopExecutionThunk.fulfilled, (state, action) => {
                state.activeExecution = null;
                // Update the loop status
                state.loops = state.loops.map(loop =>
                    loop.id === action.payload ? { ...loop, isExecuting: false, currentActivityIndex: 0 } : loop
                );
            })
            .addCase(pauseLoopExecutionThunk.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
            })
            .addCase(advanceLoopActivityThunk.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
            })
            .addCase(fetchActiveExecution.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
            })
            .addCase(initializePredefinedTemplates.fulfilled, (state, action) => {
                state.activityTemplates = action.payload;
            });
    },
});

export const {
    setDraft,
    resetDraft,
    updateDraft,
    setCurrentLoop,
    setLoops,
    setActivityTemplates,
    setActiveExecution,
    clearError,
    setError,
    setLoading
} = loopSlice.actions;

export default loopSlice.reducer; 