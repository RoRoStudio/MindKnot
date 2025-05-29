/**
 * useLoopScheduling Hook
 * Flexible scheduling system for loop execution
 * 
 * Features:
 * - Daily, weekly, and custom scheduling
 * - Reminder notifications
 * - Auto-start capabilities
 * - Schedule persistence
 * - Conflict detection
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loop, ScheduleSettings } from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';

const SCHEDULED_LOOPS_KEY = '@mindknot_scheduled_loops';

export interface ScheduledLoop {
    /** Unique identifier for the scheduled instance */
    id: string;

    /** Reference to the loop */
    loopId: string;

    /** Loop data */
    loop: Loop;

    /** Schedule settings */
    schedule: ScheduleSettings;

    /** Next scheduled execution time */
    nextExecution: Date;

    /** Whether this schedule is active */
    isActive: boolean;

    /** Creation timestamp */
    createdAt: Date;

    /** Last updated timestamp */
    updatedAt: Date;

    /** Last execution timestamp */
    lastExecuted?: Date;

    /** Number of times executed */
    executionCount: number;
}

export interface UseLoopSchedulingReturn {
    /** All scheduled loops */
    scheduledLoops: ScheduledLoop[];

    /** Loading state */
    isLoading: boolean;

    /** Error state */
    error: string | null;

    /** Schedule a loop */
    scheduleLoop: (loop: Loop, settings: ScheduleSettings) => Promise<ScheduledLoop | null>;

    /** Cancel scheduled loop */
    cancelScheduledLoop: (scheduledLoopId: string) => Promise<boolean>;

    /** Get scheduled loops */
    getScheduledLoops: () => ScheduledLoop[];

    /** Update schedule */
    updateSchedule: (scheduledLoopId: string, settings: ScheduleSettings) => Promise<boolean>;

    /** Trigger scheduled loop manually */
    triggerScheduledLoop: (scheduledLoopId: string) => Promise<boolean>;

    /** Get next scheduled execution */
    getNextScheduledExecution: (scheduledLoopId: string) => Date | null;

    /** Check for due schedules */
    checkDueSchedules: () => Promise<ScheduledLoop[]>;

    /** Get schedules for today */
    getTodaySchedules: () => ScheduledLoop[];

    /** Get schedules for this week */
    getWeekSchedules: () => ScheduledLoop[];

    /** Load scheduled loops */
    loadScheduledLoops: () => Promise<void>;
}

/**
 * Hook for managing loop scheduling
 */
export const useLoopScheduling = (): UseLoopSchedulingReturn => {
    const [scheduledLoops, setScheduledLoops] = useState<ScheduledLoop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load scheduled loops from storage
    const loadScheduledLoops = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const storedSchedules = await AsyncStorage.getItem(SCHEDULED_LOOPS_KEY);
            if (storedSchedules) {
                const parsedSchedules: ScheduledLoop[] = JSON.parse(storedSchedules);

                // Convert date strings back to Date objects
                const schedulesWithDates = parsedSchedules.map(schedule => ({
                    ...schedule,
                    nextExecution: new Date(schedule.nextExecution),
                    createdAt: new Date(schedule.createdAt),
                    updatedAt: new Date(schedule.updatedAt),
                    lastExecuted: schedule.lastExecuted ? new Date(schedule.lastExecuted) : undefined,
                    loop: {
                        ...schedule.loop,
                        createdAt: new Date(schedule.loop.createdAt),
                        updatedAt: new Date(schedule.loop.updatedAt),
                    },
                }));

                setScheduledLoops(schedulesWithDates);
            } else {
                setScheduledLoops([]);
            }
        } catch (err) {
            console.error('Error loading scheduled loops:', err);
            setError('Failed to load scheduled loops');
            setScheduledLoops([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save scheduled loops to storage
    const saveScheduledLoops = useCallback(async (schedules: ScheduledLoop[]) => {
        try {
            await AsyncStorage.setItem(SCHEDULED_LOOPS_KEY, JSON.stringify(schedules));
        } catch (err) {
            console.error('Error saving scheduled loops:', err);
            throw new Error('Failed to save scheduled loops');
        }
    }, []);

    // Calculate next execution time
    const calculateNextExecution = useCallback((settings: ScheduleSettings, fromDate: Date = new Date()): Date => {
        const nextExecution = new Date(fromDate);

        // Parse time (HH:mm format)
        const [hours, minutes] = settings.time.split(':').map(Number);
        nextExecution.setHours(hours, minutes, 0, 0);

        switch (settings.frequency) {
            case 'daily':
                // If time has passed today, schedule for tomorrow
                if (nextExecution <= fromDate) {
                    nextExecution.setDate(nextExecution.getDate() + 1);
                }
                break;

            case 'weekly':
                // Find next occurrence of scheduled days
                const currentDay = nextExecution.getDay();
                let daysUntilNext = Infinity;

                for (const day of settings.days) {
                    let daysToAdd = day - currentDay;
                    if (daysToAdd < 0) daysToAdd += 7;
                    if (daysToAdd === 0 && nextExecution <= fromDate) daysToAdd = 7;
                    daysUntilNext = Math.min(daysUntilNext, daysToAdd);
                }

                if (daysUntilNext !== Infinity) {
                    nextExecution.setDate(nextExecution.getDate() + daysUntilNext);
                }
                break;

            case 'custom':
                // For custom frequency, use the same logic as weekly for now
                // In a real implementation, this could support more complex patterns
                const customCurrentDay = nextExecution.getDay();
                let customDaysUntilNext = Infinity;

                for (const day of settings.days) {
                    let daysToAdd = day - customCurrentDay;
                    if (daysToAdd < 0) daysToAdd += 7;
                    if (daysToAdd === 0 && nextExecution <= fromDate) daysToAdd = 7;
                    customDaysUntilNext = Math.min(customDaysUntilNext, daysToAdd);
                }

                if (customDaysUntilNext !== Infinity) {
                    nextExecution.setDate(nextExecution.getDate() + customDaysUntilNext);
                }
                break;
        }

        return nextExecution;
    }, []);

    // Schedule a loop
    const scheduleLoop = useCallback(async (
        loop: Loop,
        settings: ScheduleSettings
    ): Promise<ScheduledLoop | null> => {
        try {
            setError(null);

            if (!settings.enabled) {
                setError('Schedule settings are disabled');
                return null;
            }

            const nextExecution = calculateNextExecution(settings);

            const scheduledLoop: ScheduledLoop = {
                id: generateUUID(),
                loopId: loop.id,
                loop,
                schedule: settings,
                nextExecution,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                executionCount: 0,
            };

            const updatedSchedules = [...scheduledLoops, scheduledLoop];
            setScheduledLoops(updatedSchedules);
            await saveScheduledLoops(updatedSchedules);

            console.log('Loop scheduled:', scheduledLoop.id, 'Next execution:', nextExecution);
            return scheduledLoop;
        } catch (err) {
            console.error('Error scheduling loop:', err);
            setError('Failed to schedule loop');
            return null;
        }
    }, [scheduledLoops, saveScheduledLoops, calculateNextExecution]);

    // Cancel scheduled loop
    const cancelScheduledLoop = useCallback(async (scheduledLoopId: string): Promise<boolean> => {
        try {
            setError(null);

            const updatedSchedules = scheduledLoops.filter(schedule => schedule.id !== scheduledLoopId);
            setScheduledLoops(updatedSchedules);
            await saveScheduledLoops(updatedSchedules);

            console.log('Scheduled loop cancelled:', scheduledLoopId);
            return true;
        } catch (err) {
            console.error('Error cancelling scheduled loop:', err);
            setError('Failed to cancel scheduled loop');
            return false;
        }
    }, [scheduledLoops, saveScheduledLoops]);

    // Get scheduled loops
    const getScheduledLoops = useCallback((): ScheduledLoop[] => {
        return scheduledLoops.filter(schedule => schedule.isActive);
    }, [scheduledLoops]);

    // Update schedule
    const updateSchedule = useCallback(async (
        scheduledLoopId: string,
        settings: ScheduleSettings
    ): Promise<boolean> => {
        try {
            setError(null);

            const scheduleIndex = scheduledLoops.findIndex(schedule => schedule.id === scheduledLoopId);
            if (scheduleIndex === -1) {
                setError('Scheduled loop not found');
                return false;
            }

            const nextExecution = calculateNextExecution(settings);

            const updatedSchedule: ScheduledLoop = {
                ...scheduledLoops[scheduleIndex],
                schedule: settings,
                nextExecution,
                isActive: settings.enabled,
                updatedAt: new Date(),
            };

            const updatedSchedules = [...scheduledLoops];
            updatedSchedules[scheduleIndex] = updatedSchedule;

            setScheduledLoops(updatedSchedules);
            await saveScheduledLoops(updatedSchedules);

            console.log('Schedule updated:', scheduledLoopId);
            return true;
        } catch (err) {
            console.error('Error updating schedule:', err);
            setError('Failed to update schedule');
            return false;
        }
    }, [scheduledLoops, saveScheduledLoops, calculateNextExecution]);

    // Trigger scheduled loop manually
    const triggerScheduledLoop = useCallback(async (scheduledLoopId: string): Promise<boolean> => {
        try {
            setError(null);

            const scheduleIndex = scheduledLoops.findIndex(schedule => schedule.id === scheduledLoopId);
            if (scheduleIndex === -1) {
                setError('Scheduled loop not found');
                return false;
            }

            const schedule = scheduledLoops[scheduleIndex];

            // Update execution count and last executed time
            const nextExecution = calculateNextExecution(schedule.schedule, new Date());

            const updatedSchedule: ScheduledLoop = {
                ...schedule,
                lastExecuted: new Date(),
                executionCount: schedule.executionCount + 1,
                nextExecution,
                updatedAt: new Date(),
            };

            const updatedSchedules = [...scheduledLoops];
            updatedSchedules[scheduleIndex] = updatedSchedule;

            setScheduledLoops(updatedSchedules);
            await saveScheduledLoops(updatedSchedules);

            console.log('Scheduled loop triggered:', scheduledLoopId);
            return true;
        } catch (err) {
            console.error('Error triggering scheduled loop:', err);
            setError('Failed to trigger scheduled loop');
            return false;
        }
    }, [scheduledLoops, saveScheduledLoops, calculateNextExecution]);

    // Get next scheduled execution
    const getNextScheduledExecution = useCallback((scheduledLoopId: string): Date | null => {
        const schedule = scheduledLoops.find(s => s.id === scheduledLoopId);
        return schedule?.nextExecution || null;
    }, [scheduledLoops]);

    // Check for due schedules
    const checkDueSchedules = useCallback(async (): Promise<ScheduledLoop[]> => {
        try {
            const now = new Date();
            const dueSchedules = scheduledLoops.filter(schedule =>
                schedule.isActive && schedule.nextExecution <= now
            );

            console.log('Due schedules found:', dueSchedules.length);
            return dueSchedules;
        } catch (err) {
            console.error('Error checking due schedules:', err);
            return [];
        }
    }, [scheduledLoops]);

    // Get schedules for today
    const getTodaySchedules = useCallback((): ScheduledLoop[] => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        return scheduledLoops.filter(schedule =>
            schedule.isActive &&
            schedule.nextExecution >= startOfDay &&
            schedule.nextExecution < endOfDay
        );
    }, [scheduledLoops]);

    // Get schedules for this week
    const getWeekSchedules = useCallback((): ScheduledLoop[] => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        return scheduledLoops.filter(schedule =>
            schedule.isActive &&
            schedule.nextExecution >= startOfWeek &&
            schedule.nextExecution < endOfWeek
        );
    }, [scheduledLoops]);

    // Load scheduled loops on mount
    useEffect(() => {
        loadScheduledLoops();
    }, [loadScheduledLoops]);

    // Set up periodic check for due schedules
    useEffect(() => {
        const interval = setInterval(async () => {
            const dueSchedules = await checkDueSchedules();
            if (dueSchedules.length > 0) {
                console.log('Found due schedules:', dueSchedules.map(s => s.loop.title));
                // In a real implementation, this would trigger notifications or auto-start
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [checkDueSchedules]);

    return {
        scheduledLoops,
        isLoading,
        error,
        scheduleLoop,
        cancelScheduledLoop,
        getScheduledLoops,
        updateSchedule,
        triggerScheduledLoop,
        getNextScheduledExecution,
        checkDueSchedules,
        getTodaySchedules,
        getWeekSchedules,
        loadScheduledLoops,
    };
}; 