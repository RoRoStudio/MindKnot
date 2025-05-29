/**
 * useLoopExecution Hook
 * Comprehensive execution management with background support, timer management, and session persistence
 * 
 * Features:
 * - Session management with persistence
 * - Activity navigation (next, previous, skip, complete)
 * - Timer management for activities with duration
 * - Background execution support
 * - Progress tracking
 * - Pause/resume functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import {
    ExecutionSession,
    ActivityInstance,
    Loop,
    ActivityProgress,
    ExecutionStatus
} from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';
import { RootState } from '../../../app/store/store';

const EXECUTION_SESSION_KEY = '@mindknot_execution_session';
const EXECUTION_HISTORY_KEY = '@mindknot_execution_history';

export interface UseLoopExecutionReturn {
    // Current state
    currentSession: ExecutionSession | null;
    currentLoop: Loop | null;
    currentActivity: ActivityInstance | null;
    currentActivityIndex: number;
    isExecuting: boolean;
    isPaused: boolean;
    isBackgroundMode: boolean;

    // Progress tracking
    progress: {
        completed: number;
        total: number;
        percentage: number;
        currentActivityProgress: ActivityProgress | null;
    };

    // Timer state
    timer: {
        currentTime: number;
        totalTime: number;
        isRunning: boolean;
        hasTimer: boolean;
        isOvertime: boolean;
        timeRemaining: number;
        overtimeElapsed: number;
    };

    // Actions
    startExecution: (loop: Loop) => Promise<void>;
    stopExecution: () => Promise<void>;
    pauseExecution: () => Promise<void>;
    resumeExecution: () => Promise<void>;
    completeActivity: () => Promise<void>;
    skipActivity: () => Promise<void>;
    previousActivity: () => Promise<void>;
    updateSubItemProgress: (subItemIndex: number, completed: boolean) => Promise<void>;

    // Session management
    saveSession: () => Promise<void>;
    loadActiveSession: () => Promise<ExecutionSession | null>;
    clearSession: () => Promise<void>;
    getSessionHistory: () => Promise<ExecutionSession[]>;
}

/**
 * Hook for managing loop execution with comprehensive features
 */
export const useLoopExecution = (): UseLoopExecutionReturn => {
    const dispatch = useDispatch();

    // State
    const [currentSession, setCurrentSession] = useState<ExecutionSession | null>(null);
    const [currentLoop, setCurrentLoop] = useState<Loop | null>(null);
    const [isBackgroundMode, setIsBackgroundMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isOvertime, setIsOvertime] = useState(false);

    // Refs for timers and intervals
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const sessionSaveInterval = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    // Computed values
    const currentActivityIndex = currentSession?.currentActivityIndex ?? 0;
    const currentActivity = currentLoop?.activities[currentActivityIndex] || null;
    const isExecuting = currentSession?.status === 'running' || currentSession?.status === 'paused';
    const isPaused = currentSession?.status === 'paused';

    // Progress calculation
    const progress = {
        completed: currentSession?.activityProgress.filter(p => p.status === 'completed').length ?? 0,
        total: currentLoop?.activities.length ?? 0,
        percentage: currentLoop?.activities.length
            ? Math.round(((currentSession?.activityProgress.filter(p => p.status === 'completed').length ?? 0) / currentLoop.activities.length) * 100)
            : 0,
        currentActivityProgress: currentSession?.activityProgress[currentActivityIndex] || null,
    };

    // Timer state
    const hasTimer = !!(currentActivity?.duration && currentActivity.duration > 0);
    const totalTime = (currentActivity?.duration ?? 0) * 60; // Convert minutes to seconds
    const timer = {
        currentTime,
        totalTime,
        isRunning: isTimerRunning,
        hasTimer,
        isOvertime,
        timeRemaining: hasTimer ? Math.max(0, totalTime - currentTime) : 0,
        overtimeElapsed: isOvertime ? currentTime - totalTime : 0,
    };

    // Initialize app state listener
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground
                setIsBackgroundMode(false);
                loadActiveSession();
            } else if (appStateRef.current === 'active' && nextAppState.match(/inactive|background/)) {
                // App has gone to the background
                setIsBackgroundMode(true);
                if (currentSession) {
                    saveSession();
                }
            }
            appStateRef.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [currentSession]);

    // Timer management
    useEffect(() => {
        if (isTimerRunning && hasTimer && !isPaused) {
            timerInterval.current = setInterval(() => {
                setCurrentTime(prev => {
                    const newTime = prev + 1;

                    // Check if we're entering overtime
                    if (newTime >= totalTime && !isOvertime) {
                        setIsOvertime(true);
                        console.log('Timer: Entering overtime mode');
                    }

                    // Continue running - no auto-completion
                    return newTime;
                });
            }, 1000);
        } else {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
                timerInterval.current = null;
            }
        }

        return () => {
            if (timerInterval.current) {
                clearInterval(timerInterval.current);
            }
        };
    }, [isTimerRunning, hasTimer, isPaused, totalTime, isOvertime]);

    // Auto-save session periodically
    useEffect(() => {
        if (currentSession && isExecuting) {
            sessionSaveInterval.current = setInterval(() => {
                saveSession();
            }, 30000); // Save every 30 seconds
        } else {
            if (sessionSaveInterval.current) {
                clearInterval(sessionSaveInterval.current);
                sessionSaveInterval.current = null;
            }
        }

        return () => {
            if (sessionSaveInterval.current) {
                clearInterval(sessionSaveInterval.current);
            }
        };
    }, [currentSession, isExecuting]);

    // Load active session on mount
    useEffect(() => {
        loadActiveSession();
    }, []);

    // Start execution
    const startExecution = useCallback(async (loop: Loop) => {
        try {
            const session: ExecutionSession = {
                id: generateUUID(),
                loopId: loop.id,
                startTime: new Date(),
                currentActivityIndex: 0,
                status: 'running',
                activityProgress: loop.activities.map((activity, index) => ({
                    activityId: activity.id,
                    status: index === 0 ? 'in_progress' : 'pending',
                    startTime: index === 0 ? new Date() : undefined,
                    completedSubItems: [],
                    skipped: false,
                })),
                totalDuration: 0,
                pausedDuration: 0,
            };

            setCurrentSession(session);
            setCurrentLoop(loop);
            setCurrentTime(0);
            setIsOvertime(false);

            // Start timer if first activity has duration
            if (loop.activities[0]?.duration) {
                setIsTimerRunning(true);
            }

            await saveSession();
        } catch (error) {
            console.error('Error starting execution:', error);
            throw error;
        }
    }, []);

    // Stop execution
    const stopExecution = useCallback(async () => {
        try {
            if (currentSession) {
                const updatedSession: ExecutionSession = {
                    ...currentSession,
                    status: 'cancelled',
                    endTime: new Date(),
                    totalDuration: Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000),
                };

                // Save to history
                await saveSessionToHistory(updatedSession);
            }

            // Clear current state
            setCurrentSession(null);
            setCurrentLoop(null);
            setCurrentTime(0);
            setIsTimerRunning(false);

            await clearSession();
        } catch (error) {
            console.error('Error stopping execution:', error);
            throw error;
        }
    }, [currentSession]);

    // Pause execution
    const pauseExecution = useCallback(async () => {
        if (!currentSession) return;

        try {
            const updatedSession: ExecutionSession = {
                ...currentSession,
                status: 'paused',
            };

            setCurrentSession(updatedSession);
            setIsTimerRunning(false);

            await saveSession();
        } catch (error) {
            console.error('Error pausing execution:', error);
            throw error;
        }
    }, [currentSession]);

    // Resume execution
    const resumeExecution = useCallback(async () => {
        if (!currentSession) return;

        try {
            const updatedSession: ExecutionSession = {
                ...currentSession,
                status: 'running',
            };

            setCurrentSession(updatedSession);

            // Resume timer if current activity has duration
            if (currentActivity?.duration) {
                setIsTimerRunning(true);
            }

            await saveSession();
        } catch (error) {
            console.error('Error resuming execution:', error);
            throw error;
        }
    }, [currentSession, currentActivity]);

    // Complete current activity
    const completeActivity = useCallback(async () => {
        if (!currentSession || !currentLoop) return;

        try {
            const updatedProgress = [...currentSession.activityProgress];
            updatedProgress[currentActivityIndex] = {
                ...updatedProgress[currentActivityIndex],
                status: 'completed',
                endTime: new Date(),
            };

            const nextIndex = currentActivityIndex + 1;
            const isLastActivity = nextIndex >= currentLoop.activities.length;

            if (!isLastActivity) {
                // Move to next activity
                updatedProgress[nextIndex] = {
                    ...updatedProgress[nextIndex],
                    status: 'in_progress',
                    startTime: new Date(),
                };
            }

            const updatedSession: ExecutionSession = {
                ...currentSession,
                currentActivityIndex: isLastActivity ? currentActivityIndex : nextIndex,
                activityProgress: updatedProgress,
                status: isLastActivity ? 'completed' : 'running',
                endTime: isLastActivity ? new Date() : undefined,
                totalDuration: isLastActivity
                    ? Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
                    : currentSession.totalDuration,
            };

            setCurrentSession(updatedSession);

            if (isLastActivity) {
                // Loop completed
                setIsTimerRunning(false);
                await saveSessionToHistory(updatedSession);
                await clearSession();
            } else {
                // Reset timer for next activity
                setCurrentTime(0);
                setIsOvertime(false);
                const nextActivity = currentLoop.activities[nextIndex];
                if (nextActivity?.duration) {
                    setIsTimerRunning(true);
                } else {
                    setIsTimerRunning(false);
                }
                await saveSession();
            }
        } catch (error) {
            console.error('Error completing activity:', error);
            throw error;
        }
    }, [currentSession, currentLoop, currentActivityIndex]);

    // Skip current activity
    const skipActivity = useCallback(async () => {
        if (!currentSession || !currentLoop) return;

        try {
            const updatedProgress = [...currentSession.activityProgress];
            updatedProgress[currentActivityIndex] = {
                ...updatedProgress[currentActivityIndex],
                status: 'completed',
                skipped: true,
                endTime: new Date(),
            };

            const nextIndex = currentActivityIndex + 1;
            const isLastActivity = nextIndex >= currentLoop.activities.length;

            if (!isLastActivity) {
                updatedProgress[nextIndex] = {
                    ...updatedProgress[nextIndex],
                    status: 'in_progress',
                    startTime: new Date(),
                };
            }

            const updatedSession: ExecutionSession = {
                ...currentSession,
                currentActivityIndex: isLastActivity ? currentActivityIndex : nextIndex,
                activityProgress: updatedProgress,
                status: isLastActivity ? 'completed' : 'running',
                endTime: isLastActivity ? new Date() : undefined,
            };

            setCurrentSession(updatedSession);

            if (isLastActivity) {
                setIsTimerRunning(false);
                await saveSessionToHistory(updatedSession);
                await clearSession();
            } else {
                setCurrentTime(0);
                setIsOvertime(false);
                const nextActivity = currentLoop.activities[nextIndex];
                if (nextActivity?.duration) {
                    setIsTimerRunning(true);
                } else {
                    setIsTimerRunning(false);
                }
                await saveSession();
            }
        } catch (error) {
            console.error('Error skipping activity:', error);
            throw error;
        }
    }, [currentSession, currentLoop, currentActivityIndex]);

    // Go to previous activity
    const previousActivity = useCallback(async () => {
        if (!currentSession || !currentLoop || currentActivityIndex === 0) return;

        try {
            const prevIndex = currentActivityIndex - 1;
            const updatedProgress = [...currentSession.activityProgress];

            // Reset current activity
            updatedProgress[currentActivityIndex] = {
                ...updatedProgress[currentActivityIndex],
                status: 'pending',
                startTime: undefined,
                endTime: undefined,
            };

            // Set previous activity as in progress
            updatedProgress[prevIndex] = {
                ...updatedProgress[prevIndex],
                status: 'in_progress',
                startTime: new Date(),
                endTime: undefined,
            };

            const updatedSession: ExecutionSession = {
                ...currentSession,
                currentActivityIndex: prevIndex,
                activityProgress: updatedProgress,
                status: 'running',
            };

            setCurrentSession(updatedSession);

            // Reset timer for previous activity
            setCurrentTime(0);
            const prevActivity = currentLoop.activities[prevIndex];
            if (prevActivity?.duration) {
                setIsTimerRunning(true);
            } else {
                setIsTimerRunning(false);
            }

            await saveSession();
        } catch (error) {
            console.error('Error going to previous activity:', error);
            throw error;
        }
    }, [currentSession, currentLoop, currentActivityIndex]);

    // Update sub-item progress
    const updateSubItemProgress = useCallback(async (subItemIndex: number, completed: boolean) => {
        if (!currentSession) return;

        try {
            const updatedProgress = [...currentSession.activityProgress];
            const currentActivityProgress = updatedProgress[currentActivityIndex];

            const updatedCompletedSubItems = [...(currentActivityProgress.completedSubItems || [])];

            if (completed && !updatedCompletedSubItems.includes(subItemIndex)) {
                updatedCompletedSubItems.push(subItemIndex);
            } else if (!completed) {
                const index = updatedCompletedSubItems.indexOf(subItemIndex);
                if (index > -1) {
                    updatedCompletedSubItems.splice(index, 1);
                }
            }

            updatedProgress[currentActivityIndex] = {
                ...currentActivityProgress,
                completedSubItems: updatedCompletedSubItems,
            };

            const updatedSession: ExecutionSession = {
                ...currentSession,
                activityProgress: updatedProgress,
            };

            setCurrentSession(updatedSession);
            await saveSession();
        } catch (error) {
            console.error('Error updating sub-item progress:', error);
            throw error;
        }
    }, [currentSession, currentActivityIndex]);

    // Save session to storage
    const saveSession = useCallback(async () => {
        if (!currentSession) return;

        try {
            await AsyncStorage.setItem(EXECUTION_SESSION_KEY, JSON.stringify(currentSession));
        } catch (error) {
            console.error('Error saving session:', error);
        }
    }, [currentSession]);

    // Load active session from storage
    const loadActiveSession = useCallback(async (): Promise<ExecutionSession | null> => {
        try {
            const sessionData = await AsyncStorage.getItem(EXECUTION_SESSION_KEY);
            if (sessionData) {
                const session: ExecutionSession = JSON.parse(sessionData);

                // Validate session is still active
                if (session.status === 'running' || session.status === 'paused') {
                    setCurrentSession(session);
                    // Note: Would need to load the loop data here in a real implementation
                    return session;
                }
            }
            return null;
        } catch (error) {
            console.error('Error loading active session:', error);
            return null;
        }
    }, []);

    // Clear active session
    const clearSession = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(EXECUTION_SESSION_KEY);
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }, []);

    // Save session to history
    const saveSessionToHistory = useCallback(async (session: ExecutionSession) => {
        try {
            const historyData = await AsyncStorage.getItem(EXECUTION_HISTORY_KEY);
            const history: ExecutionSession[] = historyData ? JSON.parse(historyData) : [];

            history.unshift(session); // Add to beginning

            // Keep only last 50 sessions
            const trimmedHistory = history.slice(0, 50);

            await AsyncStorage.setItem(EXECUTION_HISTORY_KEY, JSON.stringify(trimmedHistory));
        } catch (error) {
            console.error('Error saving session to history:', error);
        }
    }, []);

    // Get session history
    const getSessionHistory = useCallback(async (): Promise<ExecutionSession[]> => {
        try {
            const historyData = await AsyncStorage.getItem(EXECUTION_HISTORY_KEY);
            return historyData ? JSON.parse(historyData) : [];
        } catch (error) {
            console.error('Error getting session history:', error);
            return [];
        }
    }, []);

    return {
        // Current state
        currentSession,
        currentLoop,
        currentActivity,
        currentActivityIndex,
        isExecuting,
        isPaused,
        isBackgroundMode,

        // Progress tracking
        progress,

        // Timer state
        timer,

        // Actions
        startExecution,
        stopExecution,
        pauseExecution,
        resumeExecution,
        completeActivity,
        skipActivity,
        previousActivity,
        updateSubItemProgress,

        // Session management
        saveSession,
        loadActiveSession,
        clearSession,
        getSessionHistory,
    };
}; 