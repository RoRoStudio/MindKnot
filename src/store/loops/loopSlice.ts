import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
    Loop,
    LoopExecutionState,
    ActivityExecutionResult,
    LoopActivityInstance,
    ActivityTemplate,
    LoopProgressInfo
} from '../../types/loop';
import * as loopService from '../../api/loopService';

interface LoopState {
    // Loops data
    loops: Loop[];
    currentLoop: Loop | null;

    // Activity templates
    activityTemplates: ActivityTemplate[];
    activityTemplatesByCategory: Record<string, ActivityTemplate[]>;

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

    // Enhanced time tracking state
    activityTimers: Record<string, {
        startTime: string;
        elapsedSeconds: number;
        isRunning: boolean;
        lastUpdateTime: string;
    }>;

    // Current activity with template
    currentActivityWithTemplate: {
        activity: LoopActivityInstance;
        template: ActivityTemplate;
    } | null;

    // Current activity progress
    currentActivityProgress: LoopProgressInfo | null;
}

const initialState: LoopState = {
    loops: [],
    currentLoop: null,
    activityTemplates: [],
    activityTemplatesByCategory: {},
    activeExecution: null,
    loading: false,
    error: null,
    draft: null,
    activityTimers: {},
    currentActivityWithTemplate: null,
    currentActivityProgress: null
};

// =====================
// ASYNC THUNKS
// =====================

// Loop operations
export const fetchLoops = createAsyncThunk(
    'loops/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await loopService.getAllLoops();
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
            return await loopService.createLoop(loop);
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
            const success = await loopService.updateLoop(id, updates as any);
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
            const success = await loopService.deleteLoop(id);
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
            return await loopService.getAllActivityTemplates();
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
            return await loopService.createActivityTemplate(template);
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
            const success = await loopService.updateActivityTemplate(id, updates);
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
            const success = await loopService.deleteActivityTemplate(id);
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
            const success = await loopService.startLoopExecution(loopId);
            if (success) {
                const activeExecution = await loopService.getActiveLoopExecution();
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
            const success = await loopService.completeLoopExecution(loopId);
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
            const success = await loopService.pauseLoopExecution(loopId, isPaused);
            if (success) {
                const activeExecution = await loopService.getActiveLoopExecution();
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
            const success = await loopService.advanceLoopActivity(loopId, activityResult);
            if (success) {
                const activeExecution = await loopService.getActiveLoopExecution();
                return activeExecution;
            }
            return rejectWithValue('Failed to advance loop activity');
        } catch (error) {
            console.error('Failed to advance loop activity:', error);
            return rejectWithValue('Failed to advance loop activity');
        }
    }
);

export const navigateToActivityThunk = createAsyncThunk(
    'loops/navigateToActivity',
    async ({ loopId, targetIndex }: { loopId: string; targetIndex: number }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { loop: LoopState };
            const execution = state.loop.activeExecution;

            if (!execution) {
                return rejectWithValue('No active execution found');
            }

            const totalActivities = execution.loop.activityInstances?.length || execution.loop.activities?.length || 0;

            if (targetIndex < 0 || targetIndex >= totalActivities) {
                return rejectWithValue('Invalid activity index');
            }

            // Update the execution state to point to the new activity
            const updatedExecutionState: LoopExecutionState = {
                ...execution.executionState,
                currentActivityIndex: targetIndex,
                // Don't mark the previous activity as completed since we're just navigating
            };

            // Save the updated execution state
            const success = await loopService.saveLoopExecutionState(updatedExecutionState);
            if (success) {
                const activeExecution = await loopService.getActiveLoopExecution();
                return activeExecution;
            }
            return rejectWithValue('Failed to navigate to activity');
        } catch (error) {
            console.error('Failed to navigate to activity:', error);
            return rejectWithValue('Failed to navigate to activity');
        }
    }
);

export const fetchActiveExecution = createAsyncThunk(
    'loops/fetchActiveExecution',
    async (_, { rejectWithValue }) => {
        try {
            return await loopService.getActiveLoopExecution();
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
            await loopService.initializePredefinedActivityTemplates();
            return await loopService.getAllActivityTemplates();
        } catch (error) {
            console.error('Failed to initialize predefined templates:', error);
            return rejectWithValue('Failed to initialize predefined templates');
        }
    }
);

// Enhanced async thunks with proper time tracking
export const loadActiveExecution = createAsyncThunk(
    'loops/loadActiveExecution',
    async (_, { getState, dispatch }) => {
        const activeExecution = await loopService.getActiveLoopExecution();
        if (activeExecution) {
            // Restore timer states from execution state
            const { executionState } = activeExecution;
            const currentActivityId = activeExecution.loop.activityInstances[executionState.currentActivityIndex]?.id;

            if (currentActivityId) {
                // Calculate current elapsed time including background time
                const now = new Date().toISOString();
                const activityStartTime = executionState.activityStartTimes[currentActivityId];
                const backgroundStartTime = executionState.backgroundStartTime;

                let elapsedSeconds = executionState.activityElapsedSeconds[currentActivityId] || 0;

                // Add background time if app was backgrounded
                if (backgroundStartTime && activityStartTime) {
                    const backgroundDuration = Math.floor(
                        (new Date(now).getTime() - new Date(backgroundStartTime).getTime()) / 1000
                    );
                    elapsedSeconds += backgroundDuration;
                }

                // Update timer state
                dispatch(updateActivityTimer({
                    activityId: currentActivityId,
                    startTime: activityStartTime || now,
                    elapsedSeconds,
                    isRunning: !executionState.isPaused,
                    lastUpdateTime: now
                }));
            }
        }
        return activeExecution;
    }
);

export const navigateToActivity = createAsyncThunk(
    'loops/navigateToActivity',
    async ({ loopId, activityIndex }: { loopId: string; activityIndex: number }, { getState, dispatch }) => {
        const state = getState() as { loops: LoopState };
        const { activeExecution, activityTimers } = state.loops;

        if (!activeExecution) return false;

        const now = new Date().toISOString();
        const currentActivityId = activeExecution.loop.activityInstances[activeExecution.executionState.currentActivityIndex]?.id;
        const targetActivityId = activeExecution.loop.activityInstances[activityIndex]?.id;

        // Pause current activity timer
        if (currentActivityId && activityTimers[currentActivityId]) {
            const timer = activityTimers[currentActivityId];
            const additionalElapsed = timer.isRunning ?
                Math.floor((new Date(now).getTime() - new Date(timer.lastUpdateTime).getTime()) / 1000) : 0;

            dispatch(updateActivityTimer({
                activityId: currentActivityId,
                startTime: timer.startTime,
                elapsedSeconds: timer.elapsedSeconds + additionalElapsed,
                isRunning: false,
                lastUpdateTime: now
            }));
        }

        // Update execution state
        const updatedExecutionState: LoopExecutionState = {
            ...activeExecution.executionState,
            currentActivityIndex: activityIndex,
            lastActiveTimestamp: now,
            activityStartTimes: {
                ...activeExecution.executionState.activityStartTimes,
                [targetActivityId]: activeExecution.executionState.activityStartTimes[targetActivityId] || now
            },
            activityElapsedSeconds: {
                ...activeExecution.executionState.activityElapsedSeconds,
                [currentActivityId]: activityTimers[currentActivityId]?.elapsedSeconds || 0
            }
        };

        // Save to database
        await loopService.saveLoopExecutionState(updatedExecutionState);

        // Start timer for target activity if not paused
        if (targetActivityId && !updatedExecutionState.isPaused) {
            dispatch(updateActivityTimer({
                activityId: targetActivityId,
                startTime: updatedExecutionState.activityStartTimes[targetActivityId],
                elapsedSeconds: updatedExecutionState.activityElapsedSeconds[targetActivityId] || 0,
                isRunning: true,
                lastUpdateTime: now
            }));
        }

        return true;
    }
);

export const advanceActivity = createAsyncThunk(
    'loops/advanceActivity',
    async ({ loopId, result }: { loopId: string; result: ActivityExecutionResult }, { getState, dispatch }) => {
        const state = getState() as { loops: LoopState };
        const { activeExecution, activityTimers } = state.loops;

        if (!activeExecution) return false;

        const now = new Date().toISOString();
        const currentActivityId = result.activityId;
        const nextActivityIndex = activeExecution.executionState.currentActivityIndex + 1;
        const nextActivityId = activeExecution.loop.activityInstances[nextActivityIndex]?.id;

        // Finalize current activity timer
        if (activityTimers[currentActivityId]) {
            const timer = activityTimers[currentActivityId];
            const finalElapsed = timer.elapsedSeconds + (timer.isRunning ?
                Math.floor((new Date(now).getTime() - new Date(timer.lastUpdateTime).getTime()) / 1000) : 0);

            dispatch(updateActivityTimer({
                activityId: currentActivityId,
                startTime: timer.startTime,
                elapsedSeconds: finalElapsed,
                isRunning: false,
                lastUpdateTime: now
            }));
        }

        // Update execution state with enhanced time tracking
        const updatedExecutionState: LoopExecutionState = {
            ...activeExecution.executionState,
            currentActivityIndex: nextActivityIndex,
            completedActivities: result.completed ?
                [...activeExecution.executionState.completedActivities, currentActivityId] :
                activeExecution.executionState.completedActivities,
            completedSubActions: {
                ...activeExecution.executionState.completedSubActions,
                [currentActivityId]: result.completedSubActions
            },
            timeSpentSeconds: activeExecution.executionState.timeSpentSeconds + result.timeSpentSeconds,
            activityTimeTracking: {
                ...activeExecution.executionState.activityTimeTracking,
                [currentActivityId]: result.timeSpentSeconds
            },
            activityEndTimes: {
                ...activeExecution.executionState.activityEndTimes,
                [currentActivityId]: now
            },
            activityElapsedSeconds: {
                ...activeExecution.executionState.activityElapsedSeconds,
                [currentActivityId]: activityTimers[currentActivityId]?.elapsedSeconds || result.timeSpentSeconds
            },
            activityStartTimes: nextActivityId ? {
                ...activeExecution.executionState.activityStartTimes,
                [nextActivityId]: now
            } : activeExecution.executionState.activityStartTimes,
            lastActiveTimestamp: now
        };

        // Save to database
        await loopService.saveLoopExecutionState(updatedExecutionState);

        // Start timer for next activity if exists and not paused
        if (nextActivityId && !updatedExecutionState.isPaused) {
            dispatch(updateActivityTimer({
                activityId: nextActivityId,
                startTime: now,
                elapsedSeconds: 0,
                isRunning: true,
                lastUpdateTime: now
            }));
        }

        return await loopService.advanceLoopActivity(loopId, result);
    }
);

export const pauseLoopExecution = createAsyncThunk(
    'loops/pauseLoopExecution',
    async ({ loopId, isPaused }: { loopId: string; isPaused: boolean }, { getState, dispatch }) => {
        const state = getState() as { loops: LoopState };
        const { activeExecution, activityTimers } = state.loops;

        if (!activeExecution) return false;

        const now = new Date().toISOString();
        const currentActivityId = activeExecution.loop.activityInstances[activeExecution.executionState.currentActivityIndex]?.id;

        // Update current activity timer
        if (currentActivityId && activityTimers[currentActivityId]) {
            const timer = activityTimers[currentActivityId];
            const additionalElapsed = timer.isRunning ?
                Math.floor((new Date(now).getTime() - new Date(timer.lastUpdateTime).getTime()) / 1000) : 0;

            dispatch(updateActivityTimer({
                activityId: currentActivityId,
                startTime: timer.startTime,
                elapsedSeconds: timer.elapsedSeconds + additionalElapsed,
                isRunning: !isPaused,
                lastUpdateTime: now
            }));
        }

        // Update execution state
        const updatedExecutionState: LoopExecutionState = {
            ...activeExecution.executionState,
            isPaused,
            pausedAt: isPaused ? now : undefined,
            backgroundStartTime: isPaused ? now : undefined,
            lastActiveTimestamp: now,
            activityElapsedSeconds: currentActivityId ? {
                ...activeExecution.executionState.activityElapsedSeconds,
                [currentActivityId]: activityTimers[currentActivityId]?.elapsedSeconds || 0
            } : activeExecution.executionState.activityElapsedSeconds
        };

        await loopService.saveLoopExecutionState(updatedExecutionState);
        return await loopService.pauseLoopExecution(loopId, isPaused);
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
        },

        updateActivityTimer: (state, action: PayloadAction<{
            activityId: string;
            startTime: string;
            elapsedSeconds: number;
            isRunning: boolean;
            lastUpdateTime: string;
        }>) => {
            const { activityId, startTime, elapsedSeconds, isRunning, lastUpdateTime } = action.payload;
            state.activityTimers[activityId] = {
                startTime,
                elapsedSeconds,
                isRunning,
                lastUpdateTime
            };
        },

        syncActivityTimer: (state, action: PayloadAction<{ activityId: string }>) => {
            const { activityId } = action.payload;
            const timer = state.activityTimers[activityId];

            if (timer && timer.isRunning) {
                const now = new Date().toISOString();
                const additionalElapsed = Math.floor(
                    (new Date(now).getTime() - new Date(timer.lastUpdateTime).getTime()) / 1000
                );

                state.activityTimers[activityId] = {
                    ...timer,
                    elapsedSeconds: timer.elapsedSeconds + additionalElapsed,
                    lastUpdateTime: now
                };
            }
        },

        clearActivityTimers: (state) => {
            state.activityTimers = {};
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
            .addCase(navigateToActivityThunk.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
            })
            .addCase(fetchActiveExecution.fulfilled, (state, action) => {
                state.activeExecution = action.payload;
            })
            .addCase(initializePredefinedTemplates.fulfilled, (state, action) => {
                state.activityTemplates = action.payload;
            })
            .addCase(loadActiveExecution.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadActiveExecution.fulfilled, (state, action) => {
                state.loading = false;
                state.activeExecution = action.payload;

                if (action.payload) {
                    const { loop, executionState } = action.payload;
                    const currentActivity = loop.activityInstances[executionState.currentActivityIndex];

                    if (currentActivity) {
                        // Find template for current activity
                        const template = state.activityTemplates.find(t => t.id === currentActivity.templateId);
                        if (template) {
                            state.currentActivityWithTemplate = { activity: currentActivity, template };
                        }

                        // Set progress info
                        state.currentActivityProgress = {
                            currentIndex: executionState.currentActivityIndex,
                            totalActivities: loop.activityInstances.length,
                            completedCount: executionState.completedActivities.length,
                            progress: (executionState.completedActivities.length / loop.activityInstances.length) * 100,
                            isComplete: executionState.currentActivityIndex >= loop.activityInstances.length,
                            currentActivity,
                            nextActivity: loop.activityInstances[executionState.currentActivityIndex + 1]
                        };
                    }
                } else {
                    state.currentActivityWithTemplate = null;
                    state.currentActivityProgress = null;
                }
            })
            .addCase(loadActiveExecution.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load active execution';
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
    setLoading,
    updateActivityTimer,
    syncActivityTimer,
    clearActivityTimers
} = loopSlice.actions;

export default loopSlice.reducer; 