import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Loop, Activity } from '../../../shared/types/loop';

export interface LoopState {
    loops: Loop[];
    selectedLoop: Loop | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        searchQuery: string;
        category: string | null;
        tags: string[];
        sortBy: 'title' | 'createdAt' | 'duration' | 'lastUsed';
        sortOrder: 'asc' | 'desc';
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
    };
}

const initialState: LoopState = {
    loops: [],
    selectedLoop: null,
    isLoading: false,
    error: null,
    filters: {
        searchQuery: '',
        category: null,
        tags: [],
        sortBy: 'createdAt',
        sortOrder: 'desc',
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
    },
};

// Async thunks for loop operations
export const fetchLoops = createAsyncThunk(
    'loops/fetchLoops',
    async (params?: { page?: number; limit?: number; filters?: Partial<LoopState['filters']> }) => {
        // This would integrate with your actual data service
        // For now, returning mock data structure
        const response = await new Promise<{ loops: Loop[]; total: number }>((resolve) => {
            setTimeout(() => {
                resolve({
                    loops: [], // Would be populated by actual service
                    total: 0,
                });
            }, 100);
        });
        return response;
    }
);

export const createLoop = createAsyncThunk(
    'loops/createLoop',
    async (loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newLoop: Loop = {
            ...loopData,
            id: `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // This would integrate with your actual data service
        await new Promise(resolve => setTimeout(resolve, 100));

        return newLoop;
    }
);

export const updateLoop = createAsyncThunk(
    'loops/updateLoop',
    async ({ id, updates }: { id: string; updates: Partial<Loop> }) => {
        const updatedLoop = {
            ...updates,
            id,
            updatedAt: new Date(),
        };

        // This would integrate with your actual data service
        await new Promise(resolve => setTimeout(resolve, 100));

        return updatedLoop;
    }
);

export const deleteLoop = createAsyncThunk(
    'loops/deleteLoop',
    async (id: string) => {
        // This would integrate with your actual data service
        await new Promise(resolve => setTimeout(resolve, 100));
        return id;
    }
);

export const duplicateLoop = createAsyncThunk(
    'loops/duplicateLoop',
    async (id: string, { getState }) => {
        const state = getState() as { loops: LoopState };
        const originalLoop = state.loops.loops.find(loop => loop.id === id);

        if (!originalLoop) {
            throw new Error('Loop not found');
        }

        const duplicatedLoop: Loop = {
            ...originalLoop,
            id: `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `${originalLoop.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // This would integrate with your actual data service
        await new Promise(resolve => setTimeout(resolve, 100));

        return duplicatedLoop;
    }
);

const loopSlice = createSlice({
    name: 'loops',
    initialState,
    reducers: {
        setSelectedLoop: (state, action: PayloadAction<Loop | null>) => {
            state.selectedLoop = action.payload;
        },

        setFilters: (state, action: PayloadAction<Partial<LoopState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
            // Reset pagination when filters change
            state.pagination.page = 1;
        },

        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.pagination.page = 1;
        },

        setSortOrder: (state, action: PayloadAction<{ sortBy: LoopState['filters']['sortBy']; sortOrder: LoopState['filters']['sortOrder'] }>) => {
            state.filters.sortBy = action.payload.sortBy;
            state.filters.sortOrder = action.payload.sortOrder;
        },

        addActivity: (state, action: PayloadAction<{ loopId: string; activity: Activity }>) => {
            const loop = state.loops.find(l => l.id === action.payload.loopId);
            if (loop) {
                loop.activities.push(action.payload.activity);
                loop.updatedAt = new Date();
            }

            if (state.selectedLoop?.id === action.payload.loopId) {
                state.selectedLoop.activities.push(action.payload.activity);
                state.selectedLoop.updatedAt = new Date();
            }
        },

        updateActivity: (state, action: PayloadAction<{ loopId: string; activityId: string; updates: Partial<Activity> }>) => {
            const { loopId, activityId, updates } = action.payload;

            const loop = state.loops.find(l => l.id === loopId);
            if (loop) {
                const activityIndex = loop.activities.findIndex(a => a.id === activityId);
                if (activityIndex !== -1) {
                    loop.activities[activityIndex] = { ...loop.activities[activityIndex], ...updates };
                    loop.updatedAt = new Date();
                }
            }

            if (state.selectedLoop?.id === loopId) {
                const activityIndex = state.selectedLoop.activities.findIndex(a => a.id === activityId);
                if (activityIndex !== -1) {
                    state.selectedLoop.activities[activityIndex] = {
                        ...state.selectedLoop.activities[activityIndex],
                        ...updates
                    };
                    state.selectedLoop.updatedAt = new Date();
                }
            }
        },

        removeActivity: (state, action: PayloadAction<{ loopId: string; activityId: string }>) => {
            const { loopId, activityId } = action.payload;

            const loop = state.loops.find(l => l.id === loopId);
            if (loop) {
                loop.activities = loop.activities.filter(a => a.id !== activityId);
                loop.updatedAt = new Date();
            }

            if (state.selectedLoop?.id === loopId) {
                state.selectedLoop.activities = state.selectedLoop.activities.filter(a => a.id !== activityId);
                state.selectedLoop.updatedAt = new Date();
            }
        },

        reorderActivities: (state, action: PayloadAction<{ loopId: string; fromIndex: number; toIndex: number }>) => {
            const { loopId, fromIndex, toIndex } = action.payload;

            const reorderArray = (activities: Activity[]) => {
                const result = [...activities];
                const [removed] = result.splice(fromIndex, 1);
                result.splice(toIndex, 0, removed);
                return result;
            };

            const loop = state.loops.find(l => l.id === loopId);
            if (loop) {
                loop.activities = reorderArray(loop.activities);
                loop.updatedAt = new Date();
            }

            if (state.selectedLoop?.id === loopId) {
                state.selectedLoop.activities = reorderArray(state.selectedLoop.activities);
                state.selectedLoop.updatedAt = new Date();
            }
        },

        clearError: (state) => {
            state.error = null;
        },

        resetLoopState: () => initialState,
    },

    extraReducers: (builder) => {
        builder
            // Fetch loops
            .addCase(fetchLoops.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLoops.fulfilled, (state, action) => {
                state.isLoading = false;
                state.loops = action.payload.loops;
                state.pagination.total = action.payload.total;
                state.pagination.hasMore = state.loops.length < action.payload.total;
            })
            .addCase(fetchLoops.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch loops';
            })

            // Create loop
            .addCase(createLoop.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createLoop.fulfilled, (state, action) => {
                state.isLoading = false;
                state.loops.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createLoop.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to create loop';
            })

            // Update loop
            .addCase(updateLoop.pending, (state) => {
                state.error = null;
            })
            .addCase(updateLoop.fulfilled, (state, action) => {
                const index = state.loops.findIndex(loop => loop.id === action.payload.id);
                if (index !== -1) {
                    state.loops[index] = { ...state.loops[index], ...action.payload };
                }

                if (state.selectedLoop?.id === action.payload.id) {
                    state.selectedLoop = { ...state.selectedLoop, ...action.payload };
                }
            })
            .addCase(updateLoop.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to update loop';
            })

            // Delete loop
            .addCase(deleteLoop.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteLoop.fulfilled, (state, action) => {
                state.loops = state.loops.filter(loop => loop.id !== action.payload);
                state.pagination.total -= 1;

                if (state.selectedLoop?.id === action.payload) {
                    state.selectedLoop = null;
                }
            })
            .addCase(deleteLoop.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete loop';
            })

            // Duplicate loop
            .addCase(duplicateLoop.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(duplicateLoop.fulfilled, (state, action) => {
                state.isLoading = false;
                state.loops.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(duplicateLoop.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to duplicate loop';
            });
    },
});

export const {
    setSelectedLoop,
    setFilters,
    clearFilters,
    setSortOrder,
    addActivity,
    updateActivity,
    removeActivity,
    reorderActivities,
    clearError,
    resetLoopState,
} = loopSlice.actions;

export default loopSlice.reducer; 