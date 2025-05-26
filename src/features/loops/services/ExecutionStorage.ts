/**
 * ExecutionStorage Service
 * 
 * Handles persistence of loop execution state, history, and recovery data.
 * Provides reliable storage and retrieval for background execution continuity.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutionState, ExecutionHistory, Loop } from '../../../shared/types/loop';

// Storage keys
const STORAGE_KEYS = {
    CURRENT_EXECUTION: '@mindknot/loop_execution/current',
    EXECUTION_HISTORY: '@mindknot/loop_execution/history',
    BACKGROUND_STATE: '@mindknot/loop_execution/background',
    RECOVERY_DATA: '@mindknot/loop_execution/recovery',
    PREFERENCES: '@mindknot/loop_execution/preferences',
} as const;

export interface RecoveryData {
    /** Execution state at time of crash/close */
    executionState: ExecutionState;
    /** Timestamp when recovery data was saved */
    savedAt: number;
    /** App version when saved */
    appVersion: string;
    /** Whether the app was in background when saved */
    wasInBackground: boolean;
    /** Last known activity index */
    lastActivityIndex: number;
    /** Time remaining for current activity */
    timeRemaining?: number;
}

export interface ExecutionPreferences {
    /** Maximum number of history entries to keep */
    maxHistoryEntries: number;
    /** Auto-cleanup old history entries */
    autoCleanupHistory: boolean;
    /** Days to keep history entries */
    historyRetentionDays: number;
    /** Enable crash recovery */
    enableCrashRecovery: boolean;
    /** Auto-save interval in seconds */
    autoSaveInterval: number;
}

const DEFAULT_PREFERENCES: ExecutionPreferences = {
    maxHistoryEntries: 100,
    autoCleanupHistory: true,
    historyRetentionDays: 30,
    enableCrashRecovery: true,
    autoSaveInterval: 10, // 10 seconds
};

export class ExecutionStorage {
    private static instance: ExecutionStorage;
    private preferences: ExecutionPreferences = DEFAULT_PREFERENCES;
    private isInitialized: boolean = false;

    private constructor() { }

    public static getInstance(): ExecutionStorage {
        if (!ExecutionStorage.instance) {
            ExecutionStorage.instance = new ExecutionStorage();
        }
        return ExecutionStorage.instance;
    }

    /**
     * Initialize the storage service
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Load preferences
            await this.loadPreferences();

            // Cleanup old data if enabled
            if (this.preferences.autoCleanupHistory) {
                await this.cleanupOldHistory();
            }

            this.isInitialized = true;
            console.log('ExecutionStorage initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ExecutionStorage:', error);
            throw error;
        }
    }

    /**
     * Save current execution state
     */
    public async saveCurrentExecution(execution: ExecutionState): Promise<void> {
        try {
            const data = {
                ...execution,
                lastSavedAt: new Date().toISOString(),
            };

            await AsyncStorage.setItem(
                STORAGE_KEYS.CURRENT_EXECUTION,
                JSON.stringify(data)
            );

            console.log('Current execution saved:', execution.id);
        } catch (error) {
            console.error('Failed to save current execution:', error);
            throw error;
        }
    }

    /**
     * Load current execution state
     */
    public async loadCurrentExecution(): Promise<ExecutionState | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_EXECUTION);

            if (!data) {
                return null;
            }

            const execution = JSON.parse(data) as ExecutionState;
            console.log('Current execution loaded:', execution.id);

            return execution;
        } catch (error) {
            console.error('Failed to load current execution:', error);
            return null;
        }
    }

    /**
     * Clear current execution state
     */
    public async clearCurrentExecution(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_EXECUTION);
            console.log('Current execution cleared');
        } catch (error) {
            console.error('Failed to clear current execution:', error);
            throw error;
        }
    }

    /**
     * Save execution to history
     */
    public async saveExecutionHistory(history: ExecutionHistory): Promise<void> {
        try {
            const existingHistory = await this.loadExecutionHistory();
            const updatedHistory = [history, ...existingHistory];

            // Limit history size
            const limitedHistory = updatedHistory.slice(0, this.preferences.maxHistoryEntries);

            await AsyncStorage.setItem(
                STORAGE_KEYS.EXECUTION_HISTORY,
                JSON.stringify(limitedHistory)
            );

            console.log('Execution history saved:', history.id);
        } catch (error) {
            console.error('Failed to save execution history:', error);
            throw error;
        }
    }

    /**
     * Load execution history
     */
    public async loadExecutionHistory(): Promise<ExecutionHistory[]> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.EXECUTION_HISTORY);

            if (!data) {
                return [];
            }

            const history = JSON.parse(data) as ExecutionHistory[];
            return history;
        } catch (error) {
            console.error('Failed to load execution history:', error);
            return [];
        }
    }

    /**
     * Get execution history for a specific loop
     */
    public async getLoopExecutionHistory(loopId: string): Promise<ExecutionHistory[]> {
        try {
            const allHistory = await this.loadExecutionHistory();
            return allHistory.filter(h => h.loopId === loopId);
        } catch (error) {
            console.error('Failed to get loop execution history:', error);
            return [];
        }
    }

    /**
     * Save background state for recovery
     */
    public async saveBackgroundState(execution: ExecutionState): Promise<void> {
        try {
            const backgroundData = {
                executionId: execution.id,
                loopId: execution.loopId,
                currentActivityIndex: execution.currentActivityIndex,
                timeRemaining: execution.currentActivityTimeRemaining,
                backgroundStartTime: execution.backgroundStartTime,
                savedAt: Date.now(),
            };

            await AsyncStorage.setItem(
                STORAGE_KEYS.BACKGROUND_STATE,
                JSON.stringify(backgroundData)
            );

            console.log('Background state saved for execution:', execution.id);
        } catch (error) {
            console.error('Failed to save background state:', error);
            throw error;
        }
    }

    /**
     * Load background state
     */
    public async loadBackgroundState(): Promise<any | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_STATE);

            if (!data) {
                return null;
            }

            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load background state:', error);
            return null;
        }
    }

    /**
     * Clear background state
     */
    public async clearBackgroundState(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.BACKGROUND_STATE);
            console.log('Background state cleared');
        } catch (error) {
            console.error('Failed to clear background state:', error);
            throw error;
        }
    }

    /**
     * Save recovery data for crash recovery
     */
    public async saveRecoveryData(execution: ExecutionState, wasInBackground: boolean): Promise<void> {
        try {
            if (!this.preferences.enableCrashRecovery) {
                return;
            }

            const recoveryData: RecoveryData = {
                executionState: execution,
                savedAt: Date.now(),
                appVersion: '1.0.0', // TODO: Get from app config
                wasInBackground,
                lastActivityIndex: execution.currentActivityIndex,
                timeRemaining: execution.currentActivityTimeRemaining,
            };

            await AsyncStorage.setItem(
                STORAGE_KEYS.RECOVERY_DATA,
                JSON.stringify(recoveryData)
            );

            console.log('Recovery data saved for execution:', execution.id);
        } catch (error) {
            console.error('Failed to save recovery data:', error);
            throw error;
        }
    }

    /**
     * Load recovery data
     */
    public async loadRecoveryData(): Promise<RecoveryData | null> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_DATA);

            if (!data) {
                return null;
            }

            const recoveryData = JSON.parse(data) as RecoveryData;

            // Check if recovery data is too old (older than 24 hours)
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (Date.now() - recoveryData.savedAt > maxAge) {
                await this.clearRecoveryData();
                return null;
            }

            return recoveryData;
        } catch (error) {
            console.error('Failed to load recovery data:', error);
            return null;
        }
    }

    /**
     * Clear recovery data
     */
    public async clearRecoveryData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.RECOVERY_DATA);
            console.log('Recovery data cleared');
        } catch (error) {
            console.error('Failed to clear recovery data:', error);
            throw error;
        }
    }

    /**
     * Load preferences
     */
    private async loadPreferences(): Promise<void> {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);

            if (data) {
                const savedPreferences = JSON.parse(data) as Partial<ExecutionPreferences>;
                this.preferences = { ...DEFAULT_PREFERENCES, ...savedPreferences };
            }
        } catch (error) {
            console.error('Failed to load preferences, using defaults:', error);
            this.preferences = DEFAULT_PREFERENCES;
        }
    }

    /**
     * Save preferences
     */
    public async savePreferences(preferences: Partial<ExecutionPreferences>): Promise<void> {
        try {
            this.preferences = { ...this.preferences, ...preferences };

            await AsyncStorage.setItem(
                STORAGE_KEYS.PREFERENCES,
                JSON.stringify(this.preferences)
            );

            console.log('Execution preferences saved');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            throw error;
        }
    }

    /**
     * Get current preferences
     */
    public getPreferences(): ExecutionPreferences {
        return { ...this.preferences };
    }

    /**
     * Clean up old history entries
     */
    private async cleanupOldHistory(): Promise<void> {
        try {
            const history = await this.loadExecutionHistory();
            const cutoffDate = Date.now() - (this.preferences.historyRetentionDays * 24 * 60 * 60 * 1000);

            const filteredHistory = history.filter(h => {
                const historyDate = new Date(h.startedAt).getTime();
                return historyDate > cutoffDate;
            });

            if (filteredHistory.length !== history.length) {
                await AsyncStorage.setItem(
                    STORAGE_KEYS.EXECUTION_HISTORY,
                    JSON.stringify(filteredHistory)
                );

                console.log(`Cleaned up ${history.length - filteredHistory.length} old history entries`);
            }
        } catch (error) {
            console.error('Failed to cleanup old history:', error);
        }
    }

    /**
     * Get storage statistics
     */
    public async getStorageStats(): Promise<{
        currentExecutionSize: number;
        historyCount: number;
        historySize: number;
        hasRecoveryData: boolean;
        hasBackgroundState: boolean;
    }> {
        try {
            const [currentExecution, history, recoveryData, backgroundState] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.CURRENT_EXECUTION),
                AsyncStorage.getItem(STORAGE_KEYS.EXECUTION_HISTORY),
                AsyncStorage.getItem(STORAGE_KEYS.RECOVERY_DATA),
                AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_STATE),
            ]);

            const historyArray = history ? JSON.parse(history) : [];

            return {
                currentExecutionSize: currentExecution ? currentExecution.length : 0,
                historyCount: historyArray.length,
                historySize: history ? history.length : 0,
                hasRecoveryData: !!recoveryData,
                hasBackgroundState: !!backgroundState,
            };
        } catch (error) {
            console.error('Failed to get storage stats:', error);
            return {
                currentExecutionSize: 0,
                historyCount: 0,
                historySize: 0,
                hasRecoveryData: false,
                hasBackgroundState: false,
            };
        }
    }

    /**
     * Clear all execution data (for testing/reset)
     */
    public async clearAllData(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_EXECUTION),
                AsyncStorage.removeItem(STORAGE_KEYS.EXECUTION_HISTORY),
                AsyncStorage.removeItem(STORAGE_KEYS.BACKGROUND_STATE),
                AsyncStorage.removeItem(STORAGE_KEYS.RECOVERY_DATA),
            ]);

            console.log('All execution data cleared');
        } catch (error) {
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }
} 