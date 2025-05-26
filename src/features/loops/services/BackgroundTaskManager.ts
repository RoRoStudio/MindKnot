/**
 * BackgroundTaskManager - Manages Expo background tasks for loop execution
 * Handles background task registration, execution, and cleanup
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundTaskConfig } from '../../../shared/types/loop';

// Background task name
const LOOP_EXECUTION_TASK = 'LOOP_EXECUTION_BACKGROUND_TASK';

// Default configuration
const DEFAULT_CONFIG: BackgroundTaskConfig = {
    enabled: true,
    maxBackgroundTime: 30 * 60, // 30 minutes
    backgroundUpdateInterval: 10, // 10 seconds
    showPersistentNotification: true,
    notificationTitle: 'Loop Running',
    notificationBody: 'Your loop is running in the background',
};

/**
 * BackgroundTaskManager class
 */
export class BackgroundTaskManager {
    private isTaskRegistered: boolean = false;
    private isTaskRunning: boolean = false;
    private config: BackgroundTaskConfig = DEFAULT_CONFIG;

    constructor() {
        this.initializeBackgroundTask();
    }

    /**
     * Initialize background task registration
     */
    private async initializeBackgroundTask(): Promise<void> {
        try {
            // Check if task is already registered
            const isRegistered = await TaskManager.isTaskRegisteredAsync(LOOP_EXECUTION_TASK);

            if (!isRegistered) {
                // Define the background task
                TaskManager.defineTask(LOOP_EXECUTION_TASK, async ({ data, error }) => {
                    if (error) {
                        console.error('Background task error:', error);
                        return;
                    }

                    try {
                        // Import ExecutionEngine dynamically to avoid circular dependencies
                        const { executionEngine } = await import('./ExecutionEngine');

                        // Check if there's an active execution
                        const currentExecution = executionEngine.getCurrentExecution();
                        if (!currentExecution || currentExecution.status !== 'running') {
                            // No active execution, stop background task
                            await this.endBackgroundTask();
                            return;
                        }

                        // Update execution state
                        // The ExecutionEngine will handle the actual updates
                        console.log('Background task executed for loop:', currentExecution.loopId);

                    } catch (taskError) {
                        console.error('Error in background task execution:', taskError);
                    }
                });

                this.isTaskRegistered = true;
            } else {
                this.isTaskRegistered = true;
            }

        } catch (error) {
            console.error('Failed to initialize background task:', error);
        }
    }

    /**
     * Start background task execution
     */
    public async startBackgroundTask(): Promise<void> {
        if (!this.config.enabled || this.isTaskRunning) {
            return;
        }

        try {
            // Ensure task is registered
            if (!this.isTaskRegistered) {
                await this.initializeBackgroundTask();
            }

            // Request background fetch permissions
            const { status } = await BackgroundFetch.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Background fetch permission not granted');
                return;
            }

            // Register background fetch
            await BackgroundFetch.registerTaskAsync(LOOP_EXECUTION_TASK, {
                minimumInterval: this.config.backgroundUpdateInterval * 1000, // Convert to milliseconds
                stopOnTerminate: false, // Continue after app termination
                startOnBoot: true, // Start on device boot
            });

            this.isTaskRunning = true;
            console.log('Background task started');

        } catch (error) {
            console.error('Failed to start background task:', error);
            throw error;
        }
    }

    /**
     * End background task execution
     */
    public async endBackgroundTask(): Promise<void> {
        if (!this.isTaskRunning) {
            return;
        }

        try {
            // Unregister background fetch
            await BackgroundFetch.unregisterTaskAsync(LOOP_EXECUTION_TASK);
            this.isTaskRunning = false;
            console.log('Background task ended');

        } catch (error) {
            console.error('Failed to end background task:', error);
        }
    }

    /**
     * Update background task configuration
     */
    public updateConfig(newConfig: Partial<BackgroundTaskConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get current configuration
     */
    public getConfig(): BackgroundTaskConfig {
        return { ...this.config };
    }

    /**
     * Check if background task is supported
     */
    public async isBackgroundTaskSupported(): Promise<boolean> {
        try {
            const { status } = await BackgroundFetch.getStatusAsync();
            return status === BackgroundFetch.BackgroundFetchStatus.Available;
        } catch (error) {
            console.error('Error checking background task support:', error);
            return false;
        }
    }

    /**
     * Get background task status
     */
    public async getBackgroundTaskStatus(): Promise<{
        isSupported: boolean;
        isRegistered: boolean;
        isRunning: boolean;
        status: string;
    }> {
        try {
            const isSupported = await this.isBackgroundTaskSupported();
            const status = await BackgroundFetch.getStatusAsync();

            return {
                isSupported,
                isRegistered: this.isTaskRegistered,
                isRunning: this.isTaskRunning,
                status: this.getStatusString(status),
            };
        } catch (error) {
            console.error('Error getting background task status:', error);
            return {
                isSupported: false,
                isRegistered: false,
                isRunning: false,
                status: 'error',
            };
        }
    }

    /**
     * Convert status enum to string
     */
    private getStatusString(status: BackgroundFetch.BackgroundFetchStatus): string {
        switch (status) {
            case BackgroundFetch.BackgroundFetchStatus.Available:
                return 'available';
            case BackgroundFetch.BackgroundFetchStatus.Denied:
                return 'denied';
            case BackgroundFetch.BackgroundFetchStatus.Restricted:
                return 'restricted';
            default:
                return 'unknown';
        }
    }

    /**
     * Request background permissions
     */
    public async requestPermissions(): Promise<boolean> {
        try {
            const { status } = await BackgroundFetch.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting background permissions:', error);
            return false;
        }
    }

    /**
     * Cleanup resources
     */
    public async cleanup(): Promise<void> {
        try {
            await this.endBackgroundTask();

            // Undefine the task if it was registered
            if (this.isTaskRegistered) {
                TaskManager.undefineTask(LOOP_EXECUTION_TASK);
                this.isTaskRegistered = false;
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
} 