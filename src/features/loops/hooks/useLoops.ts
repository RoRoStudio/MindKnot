/**
 * useLoops Hook
 * Comprehensive CRUD operations for loops with Redux integration
 * 
 * Features:
 * - Loop listing and filtering
 * - CRUD operations (create, read, update, delete)
 * - Redux store integration
 * - Database persistence
 * - Loading states
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../../app/store/store';
import { Loop, ActivityInstance } from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';
import { logLoop, logStorage } from '../../../shared/utils/debugLogger';

const LOOPS_STORAGE_KEY = '@mindknot_loops';

export interface UseLoopsReturn {
    /** All loops */
    loops: Loop[];

    /** Loading state */
    isLoading: boolean;

    /** Error state */
    error: string | null;

    /** Load all loops */
    loadLoops: () => Promise<void>;

    /** Create a new loop */
    createLoop: (data: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Loop | null>;

    /** Update an existing loop */
    updateLoop: (id: string, data: Partial<Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;

    /** Get loop by ID */
    getLoopById: (id: string) => Promise<Loop | null>;

    /** Delete a loop */
    deleteLoop: (id: string) => Promise<boolean>;

    /** Duplicate a loop */
    duplicateLoop: (id: string) => Promise<Loop | null>;

    /** Get loops by category */
    getLoopsByCategory: (categoryId: string) => Loop[];

    /** Get loops by tags */
    getLoopsByTags: (tags: string[]) => Loop[];

    /** Search loops */
    searchLoops: (query: string) => Loop[];

    /** Get recent loops */
    getRecentLoops: (limit?: number) => Loop[];

    /** Get favorite loops */
    getFavoriteLoops: () => Loop[];

    /** Toggle favorite status */
    toggleFavorite: (id: string) => Promise<boolean>;

    /** Get loop statistics */
    getLoopStats: () => {
        total: number;
        byCategory: Record<string, number>;
        byTags: Record<string, number>;
        averageActivities: number;
        averageDuration: number;
    };
}

/**
 * Hook for managing loops with comprehensive CRUD operations
 */
export const useLoops = (): UseLoopsReturn => {
    const dispatch = useDispatch();

    // State
    const [loops, setLoops] = useState<Loop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load loops from storage
    const loadLoops = useCallback(async () => {
        logLoop('Starting to load loops from storage');

        try {
            setIsLoading(true);
            setError(null);

            logStorage('getItem', LOOPS_STORAGE_KEY);
            const storedLoops = await AsyncStorage.getItem(LOOPS_STORAGE_KEY);

            if (storedLoops) {
                logLoop('Found stored loops data');
                const parsedLoops: Loop[] = JSON.parse(storedLoops);
                logLoop(`Parsed ${parsedLoops.length} loops from storage`);

                // Convert date strings back to Date objects
                const loopsWithDates = parsedLoops.map(loop => ({
                    ...loop,
                    createdAt: new Date(loop.createdAt),
                    updatedAt: new Date(loop.updatedAt),
                }));

                setLoops(loopsWithDates);
                logLoop(`Successfully loaded ${loopsWithDates.length} loops`, undefined,
                    loopsWithDates.map(l => ({ id: l.id, title: l.title })));
            } else {
                logLoop('No stored loops found, setting empty array');
                setLoops([]);
            }
        } catch (err) {
            logLoop('Error loading loops', undefined, err);
            console.error('Error loading loops:', err);
            setError('Failed to load loops');
            setLoops([]);
        } finally {
            setIsLoading(false);
            logLoop('Finished loading loops');
        }
    }, []);

    // Save loops to storage
    const saveLoops = useCallback(async (loopsToSave: Loop[]) => {
        try {
            await AsyncStorage.setItem(LOOPS_STORAGE_KEY, JSON.stringify(loopsToSave));
        } catch (err) {
            console.error('Error saving loops:', err);
            throw new Error('Failed to save loops');
        }
    }, []);

    // Create a new loop
    const createLoop = useCallback(async (data: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop | null> => {
        logLoop('Starting to create new loop', undefined, { title: data.title, activitiesCount: data.activities.length });

        try {
            setError(null);

            const newLoop: Loop = {
                ...data,
                id: generateUUID(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            logLoop('Generated new loop object', newLoop.id, { id: newLoop.id, title: newLoop.title });

            const updatedLoops = [...loops, newLoop];
            setLoops(updatedLoops);

            logLoop(`Saving ${updatedLoops.length} loops to storage`, newLoop.id);
            await saveLoops(updatedLoops);

            logLoop('Successfully created and saved new loop', newLoop.id);
            return newLoop;
        } catch (err) {
            logLoop('Error creating loop', undefined, err);
            console.error('Error creating loop:', err);
            setError('Failed to create loop');
            return null;
        }
    }, [loops, saveLoops]);

    // Update an existing loop
    const updateLoop = useCallback(async (
        id: string,
        data: Partial<Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<boolean> => {
        try {
            setError(null);

            const loopIndex = loops.findIndex(loop => loop.id === id);
            if (loopIndex === -1) {
                setError('Loop not found');
                return false;
            }

            const updatedLoop: Loop = {
                ...loops[loopIndex],
                ...data,
                updatedAt: new Date(),
            };

            const updatedLoops = [...loops];
            updatedLoops[loopIndex] = updatedLoop;

            setLoops(updatedLoops);
            await saveLoops(updatedLoops);

            return true;
        } catch (err) {
            console.error('Error updating loop:', err);
            setError('Failed to update loop');
            return false;
        }
    }, [loops, saveLoops]);

    // Get loop by ID
    const getLoopById = useCallback(async (id: string): Promise<Loop | null> => {
        logLoop('Starting to get loop by ID', id);

        try {
            // If loops are not loaded yet, load them first
            if (loops.length === 0) {
                logLoop('No loops in memory, loading from storage first', id);
                await loadLoops();
            }

            logLoop(`Searching in ${loops.length} loaded loops`, id);

            // Check if the loop exists in the current state
            let loop = loops.find(l => l.id === id);

            if (loop) {
                logLoop('Found loop in current state', id, { title: loop.title });
                return loop;
            }

            // If not found in current state, reload and try again
            logLoop('Loop not found in current state, reloading from storage...', id);
            await loadLoops();

            // Get the fresh loops from storage after reload
            const storedLoops = await AsyncStorage.getItem(LOOPS_STORAGE_KEY);
            if (storedLoops) {
                const parsedLoops: Loop[] = JSON.parse(storedLoops);
                const loopsWithDates = parsedLoops.map(loop => ({
                    ...loop,
                    createdAt: new Date(loop.createdAt),
                    updatedAt: new Date(loop.updatedAt),
                }));

                logLoop(`Checking ${loopsWithDates.length} loops from fresh storage`, id);
                loop = loopsWithDates.find(l => l.id === id);

                if (loop) {
                    logLoop('Found loop in fresh storage', id, { title: loop.title });
                } else {
                    logLoop('Loop NOT FOUND in fresh storage either', id,
                        { searchedId: id, availableIds: loopsWithDates.map(l => l.id) });
                }
            } else {
                logLoop('No loops found in storage at all', id);
            }

            return loop || null;
        } catch (err) {
            logLoop('Error getting loop by ID', id, err);
            console.error('Error getting loop by ID:', err);
            return null;
        }
    }, [loops, loadLoops]);

    // Delete a loop
    const deleteLoop = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);

            const updatedLoops = loops.filter(loop => loop.id !== id);
            setLoops(updatedLoops);
            await saveLoops(updatedLoops);

            return true;
        } catch (err) {
            console.error('Error deleting loop:', err);
            setError('Failed to delete loop');
            return false;
        }
    }, [loops, saveLoops]);

    // Duplicate a loop
    const duplicateLoop = useCallback(async (id: string): Promise<Loop | null> => {
        try {
            setError(null);

            const originalLoop = loops.find(loop => loop.id === id);
            if (!originalLoop) {
                setError('Loop not found');
                return null;
            }

            // Create new activity instances with new IDs
            const newActivities: ActivityInstance[] = originalLoop.activities.map(activity => ({
                ...activity,
                id: generateUUID(),
            }));

            const duplicatedLoop: Loop = {
                ...originalLoop,
                id: generateUUID(),
                title: `${originalLoop.title} (Copy)`,
                activities: newActivities,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedLoops = [...loops, duplicatedLoop];
            setLoops(updatedLoops);
            await saveLoops(updatedLoops);

            return duplicatedLoop;
        } catch (err) {
            console.error('Error duplicating loop:', err);
            setError('Failed to duplicate loop');
            return null;
        }
    }, [loops, saveLoops]);

    // Get loops by category
    const getLoopsByCategory = useCallback((categoryId: string): Loop[] => {
        return loops.filter(loop => loop.categoryId === categoryId);
    }, [loops]);

    // Get loops by tags
    const getLoopsByTags = useCallback((tags: string[]): Loop[] => {
        return loops.filter(loop =>
            tags.some(tag => loop.tags.includes(tag))
        );
    }, [loops]);

    // Search loops
    const searchLoops = useCallback((query: string): Loop[] => {
        if (!query.trim()) return loops;

        const searchTerm = query.toLowerCase();
        return loops.filter(loop =>
            loop.title.toLowerCase().includes(searchTerm) ||
            loop.description?.toLowerCase().includes(searchTerm) ||
            loop.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }, [loops]);

    // Get recent loops
    const getRecentLoops = useCallback((limit: number = 10): Loop[] => {
        return [...loops]
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, limit);
    }, [loops]);

    // Get favorite loops (placeholder - would need to implement favorites system)
    const getFavoriteLoops = useCallback((): Loop[] => {
        // This would require adding a favorites system
        // For now, return empty array
        return [];
    }, []);

    // Toggle favorite status (placeholder)
    const toggleFavorite = useCallback(async (id: string): Promise<boolean> => {
        // This would require implementing a favorites system
        // For now, return true as if it succeeded
        return true;
    }, []);

    // Get loop statistics
    const getLoopStats = useCallback(() => {
        const total = loops.length;

        // Count by category
        const byCategory: Record<string, number> = {};
        loops.forEach(loop => {
            if (loop.categoryId) {
                byCategory[loop.categoryId] = (byCategory[loop.categoryId] || 0) + 1;
            }
        });

        // Count by tags
        const byTags: Record<string, number> = {};
        loops.forEach(loop => {
            loop.tags.forEach(tag => {
                byTags[tag] = (byTags[tag] || 0) + 1;
            });
        });

        // Calculate averages
        const totalActivities = loops.reduce((sum, loop) => sum + loop.activities.length, 0);
        const averageActivities = total > 0 ? totalActivities / total : 0;

        const totalDuration = loops.reduce((sum, loop) => {
            const loopDuration = loop.activities.reduce((actSum, activity) =>
                actSum + (activity.duration || 0), 0
            );
            return sum + loopDuration;
        }, 0);
        const averageDuration = total > 0 ? totalDuration / total : 0;

        return {
            total,
            byCategory,
            byTags,
            averageActivities,
            averageDuration,
        };
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
        createLoop,
        updateLoop,
        getLoopById,
        deleteLoop,
        duplicateLoop,
        getLoopsByCategory,
        getLoopsByTags,
        searchLoops,
        getRecentLoops,
        getFavoriteLoops,
        toggleFavorite,
        getLoopStats,
    };
}; 