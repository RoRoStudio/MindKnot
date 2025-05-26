/**
 * useLoops Hook
 * 
 * Provides loop management functionality including CRUD operations,
 * filtering, and state management.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loop, LoopFilters } from '../../../shared/types/loop';
import { ExecutionStorage } from '../services/ExecutionStorage';

// Mock data for development - replace with actual API calls
const MOCK_LOOPS: Loop[] = [
    {
        id: '1',
        title: 'Morning Routine',
        description: 'Start your day with energy and focus',
        activities: [
            {
                id: 'a1',
                type: 'breathing',
                title: 'Deep Breathing',
                description: 'Take 10 deep breaths',
                duration: 300, // 5 minutes
                settings: {
                    breathingPattern: '4-7-8',
                    cycles: 10,
                },
            },
            {
                id: 'a2',
                type: 'movement',
                title: 'Light Stretching',
                description: 'Gentle stretches to wake up your body',
                duration: 600, // 10 minutes
                settings: {
                    intensity: 'low',
                    focusAreas: ['neck', 'shoulders', 'back'],
                },
            },
            {
                id: 'a3',
                type: 'reflection',
                title: 'Daily Intention',
                description: 'Set your intention for the day',
                duration: 300, // 5 minutes
                settings: {
                    prompts: ['What do I want to accomplish today?', 'How do I want to feel?'],
                },
            },
        ],
        tags: ['morning', 'routine', 'wellness'],
        isRepeating: true,
        repeatCycles: null, // infinite
        estimatedDuration: 1200, // 20 minutes
        backgroundExecution: true,
        notifications: {
            enabled: true,
            activityStart: true,
            activityComplete: true,
            loopComplete: true,
        },
        executionCount: 5,
        lastExecutedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // week ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        title: 'Focus Session',
        description: 'Deep work session with breaks',
        activities: [
            {
                id: 'a4',
                type: 'task',
                title: 'Deep Work',
                description: 'Focus on your most important task',
                duration: 1500, // 25 minutes
                settings: {
                    allowInterruptions: false,
                    taskType: 'focused',
                },
            },
            {
                id: 'a5',
                type: 'break',
                title: 'Short Break',
                description: 'Take a quick break',
                duration: 300, // 5 minutes
                settings: {
                    breakType: 'active',
                    suggestions: ['walk', 'stretch', 'hydrate'],
                },
            },
        ],
        tags: ['productivity', 'focus', 'pomodoro'],
        isRepeating: true,
        repeatCycles: 4,
        estimatedDuration: 7200, // 2 hours (4 cycles)
        backgroundExecution: true,
        notifications: {
            enabled: true,
            activityStart: true,
            activityComplete: true,
            loopComplete: true,
        },
        executionCount: 12,
        lastExecutedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
];

export interface UseLoopsReturn {
    /** Array of all loops */
    loops: Loop[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;
    /** Load all loops */
    loadLoops: () => Promise<void>;
    /** Get a specific loop by ID */
    getLoop: (id: string) => Promise<Loop | null>;
    /** Create a new loop */
    createLoop: (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecutedAt'>) => Promise<Loop>;
    /** Update an existing loop */
    updateLoop: (id: string, updates: Partial<Loop>) => Promise<Loop>;
    /** Delete a loop */
    deleteLoop: (id: string) => Promise<void>;
    /** Filter loops */
    filterLoops: (filters: LoopFilters) => Loop[];
    /** Get all unique tags */
    allTags: string[];
    /** Search loops */
    searchLoops: (query: string) => Loop[];
    /** Get loops by tag */
    getLoopsByTag: (tag: string) => Loop[];
    /** Get recently executed loops */
    getRecentLoops: (limit?: number) => Loop[];
    /** Get favorite loops */
    getFavoriteLoops: () => Loop[];
}

export const useLoops = (): UseLoopsReturn => {
    const [loops, setLoops] = useState<Loop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load loops from storage
    const loadLoops = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // For now, use mock data
            // In production, this would fetch from API or local storage
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            setLoops(MOCK_LOOPS);
        } catch (err) {
            console.error('Failed to load loops:', err);
            setError('Failed to load loops');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get a specific loop by ID
    const getLoop = useCallback(async (id: string): Promise<Loop | null> => {
        try {
            // For now, find in mock data
            // In production, this would fetch from API
            const loop = loops.find(l => l.id === id) || MOCK_LOOPS.find(l => l.id === id);
            return loop || null;
        } catch (err) {
            console.error('Failed to get loop:', err);
            return null;
        }
    }, [loops]);

    // Create a new loop
    const createLoop = useCallback(async (
        loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecutedAt'>
    ): Promise<Loop> => {
        try {
            const newLoop: Loop = {
                ...loopData,
                id: `loop_${Date.now()}`,
                executionCount: 0,
                lastExecutedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // For now, add to local state
            // In production, this would save to API
            setLoops(prev => [...prev, newLoop]);

            return newLoop;
        } catch (err) {
            console.error('Failed to create loop:', err);
            throw new Error('Failed to create loop');
        }
    }, []);

    // Update an existing loop
    const updateLoop = useCallback(async (id: string, updates: Partial<Loop>): Promise<Loop> => {
        try {
            const updatedLoop = {
                ...updates,
                id,
                updatedAt: new Date().toISOString(),
            } as Loop;

            // For now, update local state
            // In production, this would save to API
            setLoops(prev => prev.map(loop =>
                loop.id === id ? { ...loop, ...updatedLoop } : loop
            ));

            return updatedLoop;
        } catch (err) {
            console.error('Failed to update loop:', err);
            throw new Error('Failed to update loop');
        }
    }, []);

    // Delete a loop
    const deleteLoop = useCallback(async (id: string): Promise<void> => {
        try {
            // For now, remove from local state
            // In production, this would delete from API
            setLoops(prev => prev.filter(loop => loop.id !== id));
        } catch (err) {
            console.error('Failed to delete loop:', err);
            throw new Error('Failed to delete loop');
        }
    }, []);

    // Filter loops based on criteria
    const filterLoops = useCallback((filters: LoopFilters): Loop[] => {
        let filtered = [...loops];

        // Apply query filter
        if (filters.query) {
            const query = filters.query.toLowerCase();
            filtered = filtered.filter(loop =>
                loop.title.toLowerCase().includes(query) ||
                loop.description?.toLowerCase().includes(query) ||
                loop.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply tag filter
        if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(loop =>
                filters.tags!.every(tag => loop.tags.includes(tag))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const direction = filters.sortDirection === 'desc' ? -1 : 1;

            switch (filters.sortBy) {
                case 'name':
                    return direction * a.title.localeCompare(b.title);
                case 'createdAt':
                    return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                case 'updatedAt':
                    return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
                case 'executionCount':
                    return direction * (a.executionCount - b.executionCount);
                case 'duration':
                    return direction * (a.estimatedDuration - b.estimatedDuration);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [loops]);

    // Get all unique tags
    const allTags = React.useMemo(() => {
        const tagSet = new Set<string>();
        loops.forEach(loop => {
            loop.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [loops]);

    // Search loops by query
    const searchLoops = useCallback((query: string): Loop[] => {
        return filterLoops({ query });
    }, [filterLoops]);

    // Get loops by tag
    const getLoopsByTag = useCallback((tag: string): Loop[] => {
        return loops.filter(loop => loop.tags.includes(tag));
    }, [loops]);

    // Get recently executed loops
    const getRecentLoops = useCallback((limit: number = 5): Loop[] => {
        return loops
            .filter(loop => loop.lastExecutedAt)
            .sort((a, b) => {
                const aTime = new Date(a.lastExecutedAt!).getTime();
                const bTime = new Date(b.lastExecutedAt!).getTime();
                return bTime - aTime;
            })
            .slice(0, limit);
    }, [loops]);

    // Get favorite loops (for now, most executed)
    const getFavoriteLoops = useCallback((): Loop[] => {
        return loops
            .filter(loop => loop.executionCount > 0)
            .sort((a, b) => b.executionCount - a.executionCount)
            .slice(0, 5);
    }, [loops]);

    // Load loops on mount
    useEffect(() => {
        loadLoops();
    }, [loadLoops]);

    return {
        loops,
        isLoading,
        error,
        loadLoops,
        getLoop,
        createLoop,
        updateLoop,
        deleteLoop,
        filterLoops,
        allTags,
        searchLoops,
        getLoopsByTag,
        getRecentLoops,
        getFavoriteLoops,
    };
}; 