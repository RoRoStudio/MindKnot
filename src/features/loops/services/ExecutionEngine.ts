/**
 * ExecutionEngine - Core background execution engine for loops
 * Handles loop execution, background state management, and recovery
 */

import { EventEmitter } from 'events';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    ExecutionState,
    LoopExecutionStatus,
    BackgroundState,
    Activity,
    ActivityStatus,
    Loop,
    ExecutionHistory,
    BackgroundTaskConfig
} from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';
import { BackgroundTaskManager } from './BackgroundTaskManager';
import { ExecutionStorage } from './ExecutionStorage';
import { NotificationManager } from './NotificationManager';

// Storage keys
const EXECUTION_STATE_KEY = '@MindKnot:loop_execution_state';
const BACKGROUND_STATE_KEY = '@MindKnot:loop_background_state';

/**
 * Singleton ExecutionEngine class
 */
export class ExecutionEngine extends EventEmitter {
    private static instance: ExecutionEngine;
    private currentExecution: ExecutionState | null = null;
    private timer: NodeJS.Timeout | null = null;
    private backgroundTaskManager: BackgroundTaskManager;
    private executionStorage: ExecutionStorage;
    private notificationManager: NotificationManager;
    private lastActiveTimestamp: number = Date.now();
    private isInitialized: boolean = false;
    private appStateSubscription: any = null;

    // Timer configuration
    private readonly FOREGROUND_UPDATE_INTERVAL = 1000; // 1 second
    private readonly BACKGROUND_UPDATE_INTERVAL = 10000; // 10 seconds
    private currentUpdateInterval = this.FOREGROUND_UPDATE_INTERVAL;

    private constructor() {
        super();
        this.backgroundTaskManager = new BackgroundTaskManager();
        this.executionStorage = new ExecutionStorage();
        this.notificationManager = new NotificationManager();
        this.setupAppStateListener();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): ExecutionEngine {
        if (!ExecutionEngine.instance) {
            ExecutionEngine.instance = new ExecutionEngine();
        }
        return ExecutionEngine.instance;
    }

    /**
     * Initialize the execution engine
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Attempt to recover any existing execution state
            await this.recoverFromCrash();
            this.isInitialized = true;
            this.emit('engine_initialized');
        } catch (error) {
            console.error('Failed to initialize ExecutionEngine:', error);
            this.emit('engine_error', error);
        }
    }

    /**
     * Start executing a loop
     */
    public async startLoop(loop: Loop): Promise<void> {
        try {
            // Stop any existing execution
            if (this.currentExecution) {
                await this.stopLoop();
            }

            // Create new execution state
            const executionId = generateUUID();
            const now = new Date().toISOString();

            // Prepare activities with initial state
            const activities: Activity[] = loop.activities.map((activity, index) => ({
                ...activity,
                status: index === 0 ? 'active' : 'pending',
                startedAt: index === 0 ? now : undefined,
            }));

            this.currentExecution = {
                id: executionId,
                loopId: loop.id,
                status: 'running',
                currentActivityIndex: 0,
                currentCycle: 1,
                activities,
                startedAt: now,
                totalElapsed: 0,
                currentActivityTimeRemaining: activities[0]?.duration,
                backgroundState: 'foreground',
                backgroundDuration: 0,
                continueInBackground: loop.allowBackgroundExecution,
                progress: 0,
                lastSavedAt: now,
            };

            // Start timer
            this.startTimer();

            // Save state
            await this.saveExecutionState();

            // Start background task if needed
            if (loop.allowBackgroundExecution) {
                await this.backgroundTaskManager.startBackgroundTask();
            }

            // Show notification if enabled
            if (loop.enableNotifications) {
                await this.notificationManager.showExecutionStartNotification(this.currentExecution);
            }

            this.emit('execution_started', this.currentExecution);
            this.emit('execution_update', this.currentExecution);

        } catch (error) {
            console.error('Failed to start loop execution:', error);
            this.emit('execution_error', error);
            throw error;
        }
    }

    /**
     * Pause loop execution
     */
    public async pauseLoop(): Promise<void> {
        if (!this.currentExecution || this.currentExecution.status !== 'running') {
            return;
        }

        try {
            this.currentExecution.status = 'paused';
            this.currentExecution.pausedAt = new Date().toISOString();

            // Stop timer
            this.stopTimer();

            // Save state
            await this.saveExecutionState();

            // Update notification
            await this.notificationManager.updateExecutionNotification(this.currentExecution);

            this.emit('execution_paused', this.currentExecution);
            this.emit('execution_update', this.currentExecution);

        } catch (error) {
            console.error('Failed to pause loop execution:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Resume loop execution
     */
    public async resumeLoop(): Promise<void> {
        if (!this.currentExecution || this.currentExecution.status !== 'paused') {
            return;
        }

        try {
            this.currentExecution.status = 'running';
            this.currentExecution.pausedAt = undefined;

            // Restart timer
            this.startTimer();

            // Save state
            await this.saveExecutionState();

            // Update notification
            await this.notificationManager.updateExecutionNotification(this.currentExecution);

            this.emit('execution_resumed', this.currentExecution);
            this.emit('execution_update', this.currentExecution);

        } catch (error) {
            console.error('Failed to resume loop execution:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Stop loop execution
     */
    public async stopLoop(): Promise<void> {
        if (!this.currentExecution) {
            return;
        }

        try {
            const finalExecution = { ...this.currentExecution };
            finalExecution.status = 'stopped';
            finalExecution.completedAt = new Date().toISOString();

            // Stop timer
            this.stopTimer();

            // End background task
            await this.backgroundTaskManager.endBackgroundTask();

            // Clear notifications
            await this.notificationManager.clearExecutionNotification();

            // Save final execution to history
            await this.saveExecutionHistory(finalExecution);

            // Clear current execution
            this.currentExecution = null;

            // Clear storage
            await this.clearExecutionState();

            this.emit('execution_stopped', finalExecution);

        } catch (error) {
            console.error('Failed to stop loop execution:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Skip current activity
     */
    public async skipCurrentActivity(): Promise<void> {
        if (!this.currentExecution || this.currentExecution.status !== 'running') {
            return;
        }

        try {
            const currentActivity = this.currentExecution.activities[this.currentExecution.currentActivityIndex];
            if (!currentActivity || !currentActivity.skippable) {
                return;
            }

            // Mark current activity as skipped
            currentActivity.status = 'skipped';
            currentActivity.completedAt = new Date().toISOString();

            // Move to next activity
            await this.moveToNextActivity();

        } catch (error) {
            console.error('Failed to skip activity:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Complete current activity
     */
    public async completeCurrentActivity(): Promise<void> {
        if (!this.currentExecution || this.currentExecution.status !== 'running') {
            return;
        }

        try {
            const currentActivity = this.currentExecution.activities[this.currentExecution.currentActivityIndex];
            if (!currentActivity) {
                return;
            }

            // Mark current activity as completed
            currentActivity.status = 'completed';
            currentActivity.completedAt = new Date().toISOString();
            currentActivity.actualDuration = currentActivity.duration ?
                (currentActivity.duration - (this.currentExecution.currentActivityTimeRemaining || 0)) :
                undefined;

            // Show completion notification if enabled
            if (currentActivity.notifyOnComplete) {
                await this.notificationManager.showActivityCompletionNotification(currentActivity);
            }

            // Move to next activity
            await this.moveToNextActivity();

        } catch (error) {
            console.error('Failed to complete activity:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Get current execution state
     */
    public getCurrentExecution(): ExecutionState | null {
        return this.currentExecution;
    }

    /**
     * Check if loop is currently executing
     */
    public isExecuting(): boolean {
        return this.currentExecution !== null &&
            (this.currentExecution.status === 'running' || this.currentExecution.status === 'paused');
    }

    // Private methods

    /**
     * Start the execution timer
     */
    private startTimer(): void {
        this.stopTimer(); // Ensure no existing timer

        this.timer = setInterval(() => {
            this.updateExecution();
        }, this.currentUpdateInterval);
    }

    /**
     * Stop the execution timer
     */
    private stopTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Update execution state (called by timer)
     */
    private async updateExecution(): Promise<void> {
        if (!this.currentExecution || this.currentExecution.status !== 'running') {
            return;
        }

        try {
            const now = Date.now();
            const deltaSeconds = Math.floor((now - this.lastActiveTimestamp) / 1000);
            this.lastActiveTimestamp = now;

            // Update total elapsed time
            this.currentExecution.totalElapsed += deltaSeconds;

            // Update current activity time
            const currentActivity = this.currentExecution.activities[this.currentExecution.currentActivityIndex];
            if (currentActivity && currentActivity.duration && this.currentExecution.currentActivityTimeRemaining !== undefined) {
                this.currentExecution.currentActivityTimeRemaining = Math.max(0,
                    this.currentExecution.currentActivityTimeRemaining - deltaSeconds);

                // Auto-complete timed activities when time runs out
                if (this.currentExecution.currentActivityTimeRemaining <= 0) {
                    await this.completeCurrentActivity();
                    return; // Exit early as completeCurrentActivity will trigger updates
                }
            }

            // Update progress
            this.updateProgress();

            // Save state periodically (every 10 seconds)
            if (this.currentExecution.totalElapsed % 10 === 0) {
                await this.saveExecutionState();
            }

            this.emit('execution_update', this.currentExecution);

        } catch (error) {
            console.error('Error updating execution:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Move to next activity or complete loop
     */
    private async moveToNextActivity(): Promise<void> {
        if (!this.currentExecution) return;

        const nextIndex = this.currentExecution.currentActivityIndex + 1;

        if (nextIndex >= this.currentExecution.activities.length) {
            // End of activities - complete the loop
            await this.completeLoop();
        } else {
            // Move to next activity
            this.currentExecution.currentActivityIndex = nextIndex;
            const nextActivity = this.currentExecution.activities[nextIndex];

            nextActivity.status = 'active';
            nextActivity.startedAt = new Date().toISOString();
            this.currentExecution.currentActivityTimeRemaining = nextActivity.duration;

            // Show start notification if enabled
            if (nextActivity.notifyOnStart) {
                await this.notificationManager.showActivityStartNotification(nextActivity);
            }

            await this.saveExecutionState();
            this.emit('activity_changed', nextActivity);
            this.emit('execution_update', this.currentExecution);
        }
    }

    /**
     * Complete the entire loop
     */
    private async completeLoop(): Promise<void> {
        if (!this.currentExecution) return;

        try {
            this.currentExecution.status = 'completed';
            this.currentExecution.completedAt = new Date().toISOString();
            this.currentExecution.progress = 100;

            // Stop timer
            this.stopTimer();

            // End background task
            await this.backgroundTaskManager.endBackgroundTask();

            // Show completion notification
            await this.notificationManager.showExecutionCompletionNotification(this.currentExecution);

            // Save to history
            await this.saveExecutionHistory(this.currentExecution);

            // Clear current execution
            const completedExecution = { ...this.currentExecution };
            this.currentExecution = null;

            // Clear storage
            await this.clearExecutionState();

            this.emit('execution_completed', completedExecution);

        } catch (error) {
            console.error('Failed to complete loop:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Update progress percentage
     */
    private updateProgress(): void {
        if (!this.currentExecution) return;

        const totalActivities = this.currentExecution.activities.length;
        const completedActivities = this.currentExecution.activities.filter(
            a => a.status === 'completed' || a.status === 'skipped'
        ).length;

        // Calculate progress based on completed activities plus current activity progress
        let progress = (completedActivities / totalActivities) * 100;

        // Add partial progress for current activity if it's timed
        const currentActivity = this.currentExecution.activities[this.currentExecution.currentActivityIndex];
        if (currentActivity && currentActivity.duration && this.currentExecution.currentActivityTimeRemaining !== undefined) {
            const activityProgress = 1 - (this.currentExecution.currentActivityTimeRemaining / currentActivity.duration);
            progress += (activityProgress / totalActivities) * 100;
        }

        this.currentExecution.progress = Math.min(100, Math.max(0, progress));
    }

    /**
     * Handle app state changes
     */
    private setupAppStateListener(): void {
        this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background') {
                this.handleAppBackground();
            } else if (nextAppState === 'active') {
                this.handleAppForeground();
            }
        });
    }

    /**
     * Handle app going to background
     */
    private async handleAppBackground(): Promise<void> {
        if (!this.currentExecution || !this.currentExecution.continueInBackground) {
            return;
        }

        try {
            this.currentExecution.backgroundState = 'background';
            this.currentExecution.backgroundStartTime = Date.now();

            // Switch to background update interval
            this.currentUpdateInterval = this.BACKGROUND_UPDATE_INTERVAL;
            if (this.timer) {
                this.stopTimer();
                this.startTimer();
            }

            // Save state
            await this.saveExecutionState();
            await this.saveBackgroundState();

            this.emit('execution_backgrounded', this.currentExecution);

        } catch (error) {
            console.error('Failed to handle app background:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Handle app coming to foreground
     */
    private async handleAppForeground(): Promise<void> {
        if (!this.currentExecution) {
            return;
        }

        try {
            // Calculate background time
            if (this.currentExecution.backgroundStartTime) {
                const backgroundTime = Date.now() - this.currentExecution.backgroundStartTime;
                this.currentExecution.backgroundDuration += Math.floor(backgroundTime / 1000);
                this.currentExecution.backgroundStartTime = undefined;
            }

            this.currentExecution.backgroundState = 'foreground';

            // Switch back to foreground update interval
            this.currentUpdateInterval = this.FOREGROUND_UPDATE_INTERVAL;
            if (this.timer) {
                this.stopTimer();
                this.startTimer();
            }

            // Synchronize state
            await this.synchronizeAfterBackground();

            // Save state
            await this.saveExecutionState();

            this.emit('execution_foregrounded', this.currentExecution);

        } catch (error) {
            console.error('Failed to handle app foreground:', error);
            this.emit('execution_error', error);
        }
    }

    /**
     * Synchronize execution state after background period
     */
    private async synchronizeAfterBackground(): Promise<void> {
        if (!this.currentExecution) return;

        // Reset last active timestamp to prevent large time jumps
        this.lastActiveTimestamp = Date.now();

        // Update execution state based on background time
        // This is where we could implement more sophisticated background time handling
        this.emit('execution_synchronized', this.currentExecution);
    }

    /**
     * Recover execution state after app restart
     */
    private async recoverFromCrash(): Promise<void> {
        try {
            const savedState = await this.executionStorage.loadExecutionState();
            if (!savedState) {
                return; // No state to recover
            }

            // Validate state integrity
            if (!this.validateExecutionState(savedState)) {
                console.warn('Invalid execution state found, clearing...');
                await this.clearExecutionState();
                return;
            }

            // Calculate missed time
            const now = Date.now();
            const lastSaved = new Date(savedState.lastSavedAt).getTime();
            const missedTime = Math.floor((now - lastSaved) / 1000);

            // Update state with missed time
            savedState.totalElapsed += missedTime;
            savedState.backgroundDuration += missedTime;
            savedState.backgroundState = 'recovered';
            savedState.lastSavedAt = new Date().toISOString();

            // Update current activity time if applicable
            if (savedState.currentActivityTimeRemaining !== undefined) {
                savedState.currentActivityTimeRemaining = Math.max(0,
                    savedState.currentActivityTimeRemaining - missedTime);
            }

            this.currentExecution = savedState;

            // Resume execution if it was running
            if (savedState.status === 'running') {
                this.startTimer();
                await this.backgroundTaskManager.startBackgroundTask();
            }

            this.emit('execution_recovered', this.currentExecution);
            this.emit('execution_update', this.currentExecution);

        } catch (error) {
            console.error('Failed to recover execution state:', error);
            await this.clearExecutionState(); // Clear corrupted state
        }
    }

    /**
     * Validate execution state integrity
     */
    private validateExecutionState(state: ExecutionState): boolean {
        return !!(
            state &&
            typeof state.id === 'string' &&
            typeof state.loopId === 'string' &&
            typeof state.currentActivityIndex === 'number' &&
            state.startedAt &&
            Array.isArray(state.activities) &&
            state.activities.length > 0
        );
    }

    /**
     * Save execution state to storage
     */
    private async saveExecutionState(): Promise<void> {
        if (!this.currentExecution) return;

        this.currentExecution.lastSavedAt = new Date().toISOString();
        await this.executionStorage.saveExecutionState(this.currentExecution);
    }

    /**
     * Save background state
     */
    private async saveBackgroundState(): Promise<void> {
        if (!this.currentExecution) return;

        const backgroundState = {
            executionId: this.currentExecution.id,
            backgroundStartTime: this.currentExecution.backgroundStartTime,
            backgroundDuration: this.currentExecution.backgroundDuration,
            lastSavedAt: Date.now(),
        };

        await AsyncStorage.setItem(BACKGROUND_STATE_KEY, JSON.stringify(backgroundState));
    }

    /**
     * Clear execution state from storage
     */
    private async clearExecutionState(): Promise<void> {
        await AsyncStorage.multiRemove([EXECUTION_STATE_KEY, BACKGROUND_STATE_KEY]);
    }

    /**
     * Save execution to history
     */
    private async saveExecutionHistory(execution: ExecutionState): Promise<void> {
        const historyEntry: ExecutionHistory = {
            id: generateUUID(),
            loopId: execution.loopId,
            startedAt: execution.startedAt,
            completedAt: execution.completedAt,
            finalStatus: execution.status,
            totalDuration: execution.totalElapsed,
            cyclesCompleted: execution.currentCycle,
            activitiesCompleted: execution.activities.filter(a => a.status === 'completed').length,
            activitiesSkipped: execution.activities.filter(a => a.status === 'skipped').length,
            backgroundTime: execution.backgroundDuration,
            wasInterrupted: execution.status === 'stopped',
        };

        await this.executionStorage.saveExecutionHistory(historyEntry);
    }

    /**
     * Cleanup resources
     */
    public destroy(): void {
        this.stopTimer();
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
        }
        this.removeAllListeners();
        this.backgroundTaskManager.endBackgroundTask();
    }
}

// Export singleton instance
export const executionEngine = ExecutionEngine.getInstance(); 