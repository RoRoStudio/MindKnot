import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ExecutionState, ExecutionHistory, Loop } from '../../../shared/types/loop';

export interface BackgroundState {
    isInBackground: boolean;
    backgroundStartTime: number;
    lastActiveTime: number;
    backgroundDuration: number;
}

export interface RecoveryState {
    isRecovering: boolean;
    recoveryData: ExecutionState | null;
    recoveryError: string | null;
}

export interface ExecutionSliceState {
    currentExecution: ExecutionState | null;
    executionHistory: ExecutionHistory[];
    isExecuting: boolean;
    isPaused: boolean;
    isLoading: boolean;
    error: string | null;
    backgroundState: BackgroundState;
    recoveryState: RecoveryState;
}

const initialState: ExecutionSliceState = {
    currentExecution: null,
    executionHistory: [],
    isExecuting: false,
    isPaused: false,
    isLoading: false,
    error: null,
    backgroundState: {
        isInBackground: false,
        backgroundStartTime: 0,
        lastActiveTime: Date.now(),
        backgroundDuration: 0,
    },
    recoveryState: {
        isRecovering: false,
        recoveryData: null,
        recoveryError: null,
    },
};

// Async thunks for execution operations
export const startExecution = createAsyncThunk(
    'execution/startExecution',
    async (loop: Loop) => {
        const executionState: ExecutionState = {
            id: `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            loop,
            status: 'running',
            startTime: Date.now(),
            currentActivityIndex: 0,
            currentIteration: 0,
            activityProgress: 0,
            isPaused: false,
            pausedDuration: 0,
            pausedAt: null,
            completedActivities: [],
        };

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return executionState;
    }
);

export const pauseExecution = createAsyncThunk(
    'execution/pauseExecution',
    async (_, { getState }) => {
        const state = getState() as { execution: ExecutionSliceState };
        const currentExecution = state.execution.currentExecution;

        if (!currentExecution) {
            throw new Error('No active execution to pause');
        }

        const pausedAt = Date.now();

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return { pausedAt };
    }
);

export const resumeExecution = createAsyncThunk(
    'execution/resumeExecution',
    async (_, { getState }) => {
        const state = getState() as { execution: ExecutionSliceState };
        const currentExecution = state.execution.currentExecution;

        if (!currentExecution || !currentExecution.pausedAt) {
            throw new Error('No paused execution to resume');
        }

        const resumedAt = Date.now();
        const additionalPausedDuration = resumedAt - currentExecution.pausedAt;

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return { resumedAt, additionalPausedDuration };
    }
);

export const stopExecution = createAsyncThunk(
    'execution/stopExecution',
    async (reason: 'completed' | 'cancelled', { getState }) => {
        const state = getState() as { execution: ExecutionSliceState };
        const currentExecution = state.execution.currentExecution;

        if (!currentExecution) {
            throw new Error('No active execution to stop');
        }

        const endTime = Date.now();
        const duration = endTime - currentExecution.startTime - currentExecution.pausedDuration;

        const executionHistory: ExecutionHistory = {
            id: currentExecution.id,
            loopId: currentExecution.loop.id,
            loopTitle: currentExecution.loop.title,
            status: reason,
            startTime: new Date(currentExecution.startTime),
            endTime: new Date(endTime),
            duration,
            completedActivities: currentExecution.completedActivities.length,
            totalActivities: currentExecution.loop.activities.length,
            currentIteration: currentExecution.currentIteration,
            totalIterations: currentExecution.loop.maxIterations || 1,
        };

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return { reason, executionHistory };
    }
);

export const skipActivity = createAsyncThunk(
    'execution/skipActivity',
    async (_, { getState }) => {
        const state = getState() as { execution: ExecutionSliceState };
        const currentExecution = state.execution.currentExecution;

        if (!currentExecution) {
            throw new Error('No active execution');
        }

        const nextActivityIndex = currentExecution.currentActivityIndex + 1;
        const totalActivities = currentExecution.loop.activities.length;

        let newActivityIndex = nextActivityIndex;
        let newIteration = currentExecution.currentIteration;

        // Check if we need to move to next iteration
        if (nextActivityIndex >= totalActivities) {
            const maxIterations = currentExecution.loop.maxIterations || 1;
            if (currentExecution.currentIteration + 1 < maxIterations) {
                newActivityIndex = 0;
                newIteration = currentExecution.currentIteration + 1;
            } else {
                // Loop completed
                return { completed: true };
            }
        }

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            completed: false,
            newActivityIndex,
            newIteration,
            activityProgress: 0,
        };
    }
);

export const previousActivity = createAsyncThunk(
    'execution/previousActivity',
    async (_, { getState }) => {
        const state = getState() as { execution: ExecutionSliceState };
        const currentExecution = state.execution.currentExecution;

        if (!currentExecution) {
            throw new Error('No active execution');
        }

        const prevActivityIndex = currentExecution.currentActivityIndex - 1;
        let newActivityIndex = prevActivityIndex;
        let newIteration = currentExecution.currentIteration;

        // Check if we need to move to previous iteration
        if (prevActivityIndex < 0) {
            if (currentExecution.currentIteration > 0) {
                newActivityIndex = currentExecution.loop.activities.length - 1;
                newIteration = currentExecution.currentIteration - 1;
            } else {
                // Can't go back further
                return { canGoBack: false };
            }
        }

        // This would integrate with ExecutionEngine service
        await new Promise(resolve => setTimeout(resolve, 100));

        return {
            canGoBack: true,
            newActivityIndex,
            newIteration,
            activityProgress: 0,
        };
    }
);

export const recoverExecution = createAsyncThunk(
    'execution/recoverExecution',
    async () => {
        // This would integrate with ExecutionStorage service
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock recovery data - would be loaded from storage
        const recoveryData: ExecutionState | null = null;

        return recoveryData;
    }
);

const executionSlice = createSlice({
    name: 'execution',
    initialState,
    reducers: {
        updateActivityProgress: (state, action: PayloadAction<number>) => {
            if (state.currentExecution) {
                state.currentExecution.activityProgress = Math.min(Math.max(action.payload, 0), 1);
            }
        },

        completeActivity: (state, action: PayloadAction<{
            activityId: string;
            timeSpent: number;
            result?: any;
        }>) => {
            if (state.currentExecution) {
                const { activityId, timeSpent, result } = action.payload;

                // Add to completed activities
                state.currentExecution.completedActivities.push({
                    activityId,
                    completedAt: new Date(),
                    timeSpent,
                    result,
                });

                // Move to next activity
                const nextActivityIndex = state.currentExecution.currentActivityIndex + 1;
                const totalActivities = state.currentExecution.loop.activities.length;

                if (nextActivityIndex >= totalActivities) {
                    // Check if we need to move to next iteration
                    const maxIterations = state.currentExecution.loop.maxIterations || 1;
                    if (state.currentExecution.currentIteration + 1 < maxIterations) {
                        state.currentExecution.currentActivityIndex = 0;
                        state.currentExecution.currentIteration += 1;
                        state.currentExecution.activityProgress = 0;
                    } else {
                        // Loop completed
                        state.currentExecution.status = 'completed';
                        state.isExecuting = false;
                    }
                } else {
                    state.currentExecution.currentActivityIndex = nextActivityIndex;
                    state.currentExecution.activityProgress = 0;
                }
            }
        },

        handleAppBackground: (state) => {
            state.backgroundState.isInBackground = true;
            state.backgroundState.backgroundStartTime = Date.now();
            state.backgroundState.lastActiveTime = Date.now();
        },

        handleAppForeground: (state) => {
            if (state.backgroundState.isInBackground) {
                const backgroundDuration = Date.now() - state.backgroundState.backgroundStartTime;
                state.backgroundState.backgroundDuration += backgroundDuration;
                state.backgroundState.isInBackground = false;
                state.backgroundState.lastActiveTime = Date.now();

                // Update execution state if needed
                if (state.currentExecution && state.isExecuting && !state.isPaused) {
                    // This would trigger background time calculation and state sync
                }
            }
        },

        clearExecutionError: (state) => {
            state.error = null;
        },

        resetExecutionState: () => initialState,
    },

    extraReducers: (builder) => {
        builder
            // Start execution
            .addCase(startExecution.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(startExecution.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentExecution = action.payload;
                state.isExecuting = true;
                state.isPaused = false;
            })
            .addCase(startExecution.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to start execution';
            })

            // Pause execution
            .addCase(pauseExecution.pending, (state) => {
                state.error = null;
            })
            .addCase(pauseExecution.fulfilled, (state, action) => {
                if (state.currentExecution) {
                    state.currentExecution.isPaused = true;
                    state.currentExecution.pausedAt = action.payload.pausedAt;
                    state.isPaused = true;
                }
            })
            .addCase(pauseExecution.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to pause execution';
            })

            // Resume execution
            .addCase(resumeExecution.pending, (state) => {
                state.error = null;
            })
            .addCase(resumeExecution.fulfilled, (state, action) => {
                if (state.currentExecution) {
                    state.currentExecution.isPaused = false;
                    state.currentExecution.pausedDuration += action.payload.additionalPausedDuration;
                    state.currentExecution.pausedAt = null;
                    state.isPaused = false;
                }
            })
            .addCase(resumeExecution.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to resume execution';
            })

            // Stop execution
            .addCase(stopExecution.pending, (state) => {
                state.error = null;
            })
            .addCase(stopExecution.fulfilled, (state, action) => {
                if (state.currentExecution) {
                    state.currentExecution.status = action.payload.reason;
                }
                state.executionHistory.unshift(action.payload.executionHistory);
                state.currentExecution = null;
                state.isExecuting = false;
                state.isPaused = false;
            })
            .addCase(stopExecution.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to stop execution';
            })

            // Skip activity
            .addCase(skipActivity.fulfilled, (state, action) => {
                if (state.currentExecution && !action.payload.completed) {
                    state.currentExecution.currentActivityIndex = action.payload.newActivityIndex;
                    state.currentExecution.currentIteration = action.payload.newIteration;
                    state.currentExecution.activityProgress = action.payload.activityProgress;
                } else if (action.payload.completed) {
                    if (state.currentExecution) {
                        state.currentExecution.status = 'completed';
                    }
                    state.isExecuting = false;
                }
            })
            .addCase(skipActivity.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to skip activity';
            })

            // Previous activity
            .addCase(previousActivity.fulfilled, (state, action) => {
                if (state.currentExecution && action.payload.canGoBack) {
                    state.currentExecution.currentActivityIndex = action.payload.newActivityIndex;
                    state.currentExecution.currentIteration = action.payload.newIteration;
                    state.currentExecution.activityProgress = action.payload.activityProgress;
                }
            })
            .addCase(previousActivity.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to go to previous activity';
            })

            // Recover execution
            .addCase(recoverExecution.pending, (state) => {
                state.recoveryState.isRecovering = true;
                state.recoveryState.recoveryError = null;
            })
            .addCase(recoverExecution.fulfilled, (state, action) => {
                state.recoveryState.isRecovering = false;
                state.recoveryState.recoveryData = action.payload;

                if (action.payload) {
                    state.currentExecution = action.payload;
                    state.isExecuting = action.payload.status === 'running';
                    state.isPaused = action.payload.isPaused;
                }
            })
            .addCase(recoverExecution.rejected, (state, action) => {
                state.recoveryState.isRecovering = false;
                state.recoveryState.recoveryError = action.error.message || 'Failed to recover execution';
            });
    },
});

export const {
    updateActivityProgress,
    completeActivity,
    handleAppBackground,
    handleAppForeground,
    clearExecutionError,
    resetExecutionState,
} = executionSlice.actions;

export default executionSlice.reducer; 