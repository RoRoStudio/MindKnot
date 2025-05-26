import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { ExecutionSliceState } from './executionSlice';
import { ExecutionState, ExecutionHistory } from '../../../shared/types/loop';

// Base selectors
export const selectExecutionState = (state: RootState): ExecutionSliceState => state.execution;

export const selectCurrentExecution = createSelector(
    [selectExecutionState],
    (executionState) => executionState.currentExecution
);

export const selectExecutionHistory = createSelector(
    [selectExecutionState],
    (executionState) => executionState.executionHistory
);

export const selectIsExecuting = createSelector(
    [selectExecutionState],
    (executionState) => executionState.isExecuting
);

export const selectIsPaused = createSelector(
    [selectExecutionState],
    (executionState) => executionState.isPaused
);

export const selectExecutionLoading = createSelector(
    [selectExecutionState],
    (executionState) => executionState.isLoading
);

export const selectExecutionError = createSelector(
    [selectExecutionState],
    (executionState) => executionState.error
);

export const selectBackgroundState = createSelector(
    [selectExecutionState],
    (executionState) => executionState.backgroundState
);

export const selectRecoveryState = createSelector(
    [selectExecutionState],
    (executionState) => executionState.recoveryState
);

// Computed selectors for current execution
export const selectCurrentActivity = createSelector(
    [selectCurrentExecution],
    (execution) => {
        if (!execution || execution.currentActivityIndex < 0) return null;
        return execution.loop.activities[execution.currentActivityIndex] || null;
    }
);

export const selectCurrentActivityIndex = createSelector(
    [selectCurrentExecution],
    (execution) => execution?.currentActivityIndex ?? -1
);

export const selectCurrentIteration = createSelector(
    [selectCurrentExecution],
    (execution) => execution?.currentIteration ?? 0
);

export const selectExecutionProgress = createSelector(
    [selectCurrentExecution],
    (execution) => {
        if (!execution) return { overall: 0, activity: 0, iteration: 0 };

        const totalActivities = execution.loop.activities.length;
        const completedActivities = execution.currentActivityIndex;
        const currentActivityProgress = execution.activityProgress;

        // Overall progress across all iterations
        const totalIterations = execution.loop.maxIterations || 1;
        const currentIteration = execution.currentIteration;
        const iterationProgress = totalActivities > 0
            ? (completedActivities + currentActivityProgress) / totalActivities
            : 0;
        const overallProgress = totalIterations > 0
            ? (currentIteration + iterationProgress) / totalIterations
            : 0;

        return {
            overall: Math.min(Math.max(overallProgress, 0), 1),
            activity: Math.min(Math.max(currentActivityProgress, 0), 1),
            iteration: Math.min(Math.max(iterationProgress, 0), 1),
        };
    }
);

export const selectExecutionTiming = createSelector(
    [selectCurrentExecution],
    (execution) => {
        if (!execution) return null;

        const now = Date.now();
        const startTime = execution.startTime;
        const pausedDuration = execution.pausedDuration;
        const elapsedTime = now - startTime - pausedDuration;

        // Calculate total expected duration
        const totalDuration = execution.loop.activities.reduce(
            (sum, activity) => sum + activity.duration * 1000, 0
        ) * (execution.loop.maxIterations || 1);

        // Calculate remaining time
        const currentActivity = execution.loop.activities[execution.currentActivityIndex];
        const currentActivityRemaining = currentActivity
            ? (currentActivity.duration * 1000) * (1 - execution.activityProgress)
            : 0;

        const remainingActivities = execution.loop.activities.slice(execution.currentActivityIndex + 1);
        const remainingActivitiesDuration = remainingActivities.reduce(
            (sum, activity) => sum + activity.duration * 1000, 0
        );

        const remainingIterations = (execution.loop.maxIterations || 1) - execution.currentIteration - 1;
        const remainingIterationsDuration = remainingIterations > 0
            ? remainingIterations * execution.loop.activities.reduce(
                (sum, activity) => sum + activity.duration * 1000, 0
            )
            : 0;

        const remainingTime = currentActivityRemaining + remainingActivitiesDuration + remainingIterationsDuration;

        return {
            elapsedTime,
            remainingTime: Math.max(remainingTime, 0),
            totalDuration,
            estimatedEndTime: now + remainingTime,
            isPaused: execution.isPaused,
            pausedDuration,
        };
    }
);

export const selectExecutionStatus = createSelector(
    [selectIsExecuting, selectIsPaused, selectCurrentExecution],
    (isExecuting, isPaused, execution) => {
        if (!execution) return 'idle';
        if (isPaused) return 'paused';
        if (isExecuting) return 'running';
        if (execution.status === 'completed') return 'completed';
        if (execution.status === 'cancelled') return 'cancelled';
        return 'idle';
    }
);

export const selectCanPause = createSelector(
    [selectExecutionStatus],
    (status) => status === 'running'
);

export const selectCanResume = createSelector(
    [selectExecutionStatus],
    (status) => status === 'paused'
);

export const selectCanStop = createSelector(
    [selectExecutionStatus],
    (status) => status === 'running' || status === 'paused'
);

export const selectCanSkip = createSelector(
    [selectCurrentExecution, selectExecutionStatus],
    (execution, status) => {
        if (!execution || (status !== 'running' && status !== 'paused')) return false;
        return execution.currentActivityIndex < execution.loop.activities.length - 1 ||
            execution.currentIteration < (execution.loop.maxIterations || 1) - 1;
    }
);

export const selectCanGoBack = createSelector(
    [selectCurrentExecution, selectExecutionStatus],
    (execution, status) => {
        if (!execution || (status !== 'running' && status !== 'paused')) return false;
        return execution.currentActivityIndex > 0 || execution.currentIteration > 0;
    }
);

// History selectors
export const selectRecentExecutions = createSelector(
    [selectExecutionHistory],
    (history) => {
        return history
            .slice()
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, 10);
    }
);

export const selectExecutionHistoryByLoop = createSelector(
    [selectExecutionHistory, (state: RootState, loopId: string) => loopId],
    (history, loopId) => {
        return history
            .filter(execution => execution.loopId === loopId)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }
);

export const selectExecutionStats = createSelector(
    [selectExecutionHistory],
    (history) => {
        const completedExecutions = history.filter(exec => exec.status === 'completed');
        const totalExecutions = history.length;
        const totalDuration = history.reduce((sum, exec) => sum + (exec.duration || 0), 0);

        const completionRate = totalExecutions > 0 ? completedExecutions.length / totalExecutions : 0;
        const averageDuration = completedExecutions.length > 0
            ? completedExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) / completedExecutions.length
            : 0;

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        const sortedHistory = history
            .slice()
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        for (let i = sortedHistory.length - 1; i >= 0; i--) {
            if (sortedHistory[i].status === 'completed') {
                tempStreak++;
                if (i === sortedHistory.length - 1) {
                    currentStreak = tempStreak;
                }
            } else {
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
                tempStreak = 0;
            }
        }

        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
        }

        return {
            totalExecutions,
            completedExecutions: completedExecutions.length,
            cancelledExecutions: history.filter(exec => exec.status === 'cancelled').length,
            completionRate,
            totalDuration,
            averageDuration,
            currentStreak,
            longestStreak,
        };
    }
);

export const selectExecutionStatsForLoop = createSelector(
    [selectExecutionHistory, (state: RootState, loopId: string) => loopId],
    (history, loopId) => {
        const loopHistory = history.filter(exec => exec.loopId === loopId);
        const completedExecutions = loopHistory.filter(exec => exec.status === 'completed');

        return {
            totalExecutions: loopHistory.length,
            completedExecutions: completedExecutions.length,
            completionRate: loopHistory.length > 0 ? completedExecutions.length / loopHistory.length : 0,
            lastExecuted: loopHistory.length > 0
                ? new Date(Math.max(...loopHistory.map(exec => new Date(exec.startTime).getTime())))
                : null,
            averageDuration: completedExecutions.length > 0
                ? completedExecutions.reduce((sum, exec) => sum + (exec.duration || 0), 0) / completedExecutions.length
                : 0,
        };
    }
);

// Background execution selectors
export const selectIsInBackground = createSelector(
    [selectBackgroundState],
    (backgroundState) => backgroundState.isInBackground
);

export const selectBackgroundDuration = createSelector(
    [selectBackgroundState],
    (backgroundState) => {
        if (!backgroundState.isInBackground || !backgroundState.backgroundStartTime) return 0;
        return Date.now() - backgroundState.backgroundStartTime;
    }
);

export const selectTimeSinceLastActive = createSelector(
    [selectBackgroundState],
    (backgroundState) => {
        return Date.now() - backgroundState.lastActiveTime;
    }
);

// Recovery selectors
export const selectIsRecovering = createSelector(
    [selectRecoveryState],
    (recoveryState) => recoveryState.isRecovering
);

export const selectRecoveryData = createSelector(
    [selectRecoveryState],
    (recoveryState) => recoveryState.recoveryData
);

export const selectRecoveryError = createSelector(
    [selectRecoveryState],
    (recoveryState) => recoveryState.recoveryError
);

export const selectHasRecoverableExecution = createSelector(
    [selectRecoveryData],
    (recoveryData) => !!recoveryData
);

// Utility selectors
export const selectExecutionLoadingState = createSelector(
    [selectExecutionLoading, selectExecutionError],
    (isLoading, error) => ({
        isLoading,
        hasError: !!error,
        error,
    })
);

export const selectIsExecutionActive = createSelector(
    [selectCurrentExecution, selectIsExecuting],
    (execution, isExecuting) => !!(execution && isExecuting)
);

export const selectExecutionSummary = createSelector(
    [selectCurrentExecution, selectExecutionProgress, selectExecutionTiming, selectExecutionStatus],
    (execution, progress, timing, status) => {
        if (!execution) return null;

        return {
            loopId: execution.loop.id,
            loopTitle: execution.loop.title,
            status,
            progress,
            timing,
            currentActivity: execution.loop.activities[execution.currentActivityIndex],
            currentActivityIndex: execution.currentActivityIndex,
            currentIteration: execution.currentIteration,
            totalIterations: execution.loop.maxIterations || 1,
            totalActivities: execution.loop.activities.length,
        };
    }
); 