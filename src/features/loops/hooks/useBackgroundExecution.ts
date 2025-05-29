/**
 * useBackgroundExecution Hook
 * Handles app state changes and background tasks for loop execution
 * 
 * Features:
 * - App state monitoring (foreground/background transitions)
 * - Background task registration and management
 * - Session persistence during background execution
 * - Proper cleanup and recovery
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutionSession } from '../../../shared/types/loop';

const BACKGROUND_SESSION_KEY = '@mindknot_background_session';

export interface UseBackgroundExecutionReturn {
    /** Whether background execution is enabled */
    isBackgroundEnabled: boolean;

    /** Current background task ID */
    backgroundTaskId: string | null;

    /** Whether app is currently in background */
    isInBackground: boolean;

    /** Start background task */
    startBackgroundTask: (session: ExecutionSession) => Promise<void>;

    /** Stop background task */
    stopBackgroundTask: () => Promise<void>;

    /** Update background progress */
    updateBackgroundProgress: (session: ExecutionSession) => Promise<void>;

    /** Handle app state change */
    handleAppStateChange: (nextAppState: AppStateStatus) => Promise<void>;

    /** Register background session */
    registerBackgroundSession: (session: ExecutionSession) => Promise<void>;

    /** Clear background session */
    clearBackgroundSession: () => Promise<void>;

    /** Get background session */
    getBackgroundSession: () => Promise<ExecutionSession | null>;
}

/**
 * Hook for managing background execution
 */
export const useBackgroundExecution = (): UseBackgroundExecutionReturn => {
    const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);
    const [backgroundTaskId, setBackgroundTaskId] = useState<string | null>(null);
    const [isInBackground, setIsInBackground] = useState(false);

    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const backgroundStartTime = useRef<number | null>(null);

    // Initialize app state listener
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            setIsInBackground(nextAppState === 'background' || nextAppState === 'inactive');

            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                console.log('App came to foreground');
                handleForegroundTransition();
            } else if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
                // App has gone to the background
                console.log('App went to background');
                handleBackgroundTransition();
            }

            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    // Handle foreground transition
    const handleForegroundTransition = useCallback(async () => {
        try {
            // Check if there's a background session to recover
            const backgroundSession = await getBackgroundSession();
            if (backgroundSession) {
                console.log('Recovering background session:', backgroundSession.id);
                // Session recovery would be handled by the execution hook
            }
        } catch (error) {
            console.error('Error handling foreground transition:', error);
        }
    }, []);

    // Handle background transition
    const handleBackgroundTransition = useCallback(async () => {
        try {
            if (backgroundTaskId) {
                console.log('App going to background with active task:', backgroundTaskId);
                backgroundStartTime.current = Date.now();
            }
        } catch (error) {
            console.error('Error handling background transition:', error);
        }
    }, [backgroundTaskId]);

    // Start background task
    const startBackgroundTask = useCallback(async (session: ExecutionSession): Promise<void> => {
        try {
            if (!isBackgroundEnabled) {
                console.log('Background execution is disabled');
                return;
            }

            // In a real implementation, this would register with the OS background task system
            // For React Native, this might involve:
            // - expo-background-fetch for periodic updates
            // - expo-task-manager for background tasks
            // - Push notifications for session updates

            const taskId = `loop_execution_${session.id}`;
            setBackgroundTaskId(taskId);

            // Register the session for background execution
            await registerBackgroundSession(session);

            console.log('Background task started:', taskId);
        } catch (error) {
            console.error('Error starting background task:', error);
            throw error;
        }
    }, [isBackgroundEnabled]);

    // Stop background task
    const stopBackgroundTask = useCallback(async (): Promise<void> => {
        try {
            if (backgroundTaskId) {
                // In a real implementation, this would unregister the background task
                console.log('Background task stopped:', backgroundTaskId);
                setBackgroundTaskId(null);
                backgroundStartTime.current = null;
            }

            await clearBackgroundSession();
        } catch (error) {
            console.error('Error stopping background task:', error);
            throw error;
        }
    }, [backgroundTaskId]);

    // Update background progress
    const updateBackgroundProgress = useCallback(async (session: ExecutionSession): Promise<void> => {
        try {
            if (!backgroundTaskId) return;

            // Update the stored session with current progress
            await registerBackgroundSession(session);

            // In a real implementation, this might:
            // - Update a persistent notification
            // - Send progress to a background service
            // - Update local storage for recovery

            console.log('Background progress updated for session:', session.id);
        } catch (error) {
            console.error('Error updating background progress:', error);
        }
    }, [backgroundTaskId]);

    // Handle app state change (public interface)
    const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus): Promise<void> => {
        // This is handled internally by the useEffect, but provided as public interface
        // for manual state management if needed
        console.log('App state change:', appStateRef.current, '->', nextAppState);
    }, []);

    // Register background session
    const registerBackgroundSession = useCallback(async (session: ExecutionSession): Promise<void> => {
        try {
            const sessionData = {
                ...session,
                backgroundRegisteredAt: new Date().toISOString(),
                backgroundTaskId,
            };

            await AsyncStorage.setItem(BACKGROUND_SESSION_KEY, JSON.stringify(sessionData));
            console.log('Background session registered:', session.id);
        } catch (error) {
            console.error('Error registering background session:', error);
            throw error;
        }
    }, [backgroundTaskId]);

    // Clear background session
    const clearBackgroundSession = useCallback(async (): Promise<void> => {
        try {
            await AsyncStorage.removeItem(BACKGROUND_SESSION_KEY);
            console.log('Background session cleared');
        } catch (error) {
            console.error('Error clearing background session:', error);
        }
    }, []);

    // Get background session
    const getBackgroundSession = useCallback(async (): Promise<ExecutionSession | null> => {
        try {
            const sessionData = await AsyncStorage.getItem(BACKGROUND_SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);

                // Convert date strings back to Date objects
                if (session.startTime) {
                    session.startTime = new Date(session.startTime);
                }
                if (session.endTime) {
                    session.endTime = new Date(session.endTime);
                }

                return session;
            }
            return null;
        } catch (error) {
            console.error('Error getting background session:', error);
            return null;
        }
    }, []);

    return {
        isBackgroundEnabled,
        backgroundTaskId,
        isInBackground,
        startBackgroundTask,
        stopBackgroundTask,
        updateBackgroundProgress,
        handleAppStateChange,
        registerBackgroundSession,
        clearBackgroundSession,
        getBackgroundSession,
    };
}; 