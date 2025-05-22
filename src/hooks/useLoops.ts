import { useState, useEffect, useCallback } from 'react';
import { Loop } from '../types/loop';
import { createLoop, getAllLoops, updateLoop as updateLoopService } from '../services/loopService';
import { useSagaActions } from '../redux/hooks/stateHooks';
import { executeSql } from '../database/database';

export function useLoops() {
    const [loops, setLoops] = useState<Loop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { selectedSagaId } = useSagaActions();

    const loadLoops = useCallback(async (sagaId?: string) => {
        try {
            console.log("Loading loops...");
            setLoading(true);
            setError(null);

            const allLoops = await getAllLoops();
            console.log(`Loaded ${allLoops.length} loops`);
            setLoops(allLoops);
            return allLoops;
        } catch (err) {
            console.error('Failed to load loops:', err);
            setError('Failed to load loops');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Load loops when the component mounts
    useEffect(() => {
        loadLoops();
    }, [loadLoops]);

    const addLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newLoop = await createLoop(loop);

            // Update state with the new loop
            setLoops(prev => [newLoop, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create loop:', err);
            setError('Failed to create loop');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Get loops for today based on frequency
    const getTodayLoops = () => {
        const today = new Date();
        const dayOfWeek = today.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();

        return loops.filter(loop => {
            // Default to showing all loops if there's an issue
            if (!loop.frequency) return true;

            let frequencyType = '';

            try {
                // Check if it's a simple string frequency first
                if (typeof loop.frequency === 'string') {
                    // Check if it's already a simple string type
                    if (['daily', 'weekdays', 'weekends', 'weekly'].includes(loop.frequency)) {
                        frequencyType = loop.frequency;
                    } else {
                        // Try to parse as JSON, but gracefully handle non-JSON strings
                        try {
                            const parsed = JSON.parse(loop.frequency);
                            frequencyType = parsed.type || '';
                        } catch (e) {
                            // If not valid JSON, treat as simple string value
                            frequencyType = loop.frequency;
                        }
                    }
                } else if (typeof loop.frequency === 'object' && loop.frequency !== null) {
                    // It's already an object, get the type directly
                    frequencyType = (loop.frequency as any).type || '';
                }
            } catch (e) {
                console.error('Error processing frequency:', e, loop.frequency);
                return true; // Show the loop if we can't process the frequency
            }

            if (frequencyType === 'daily') return true;
            if (frequencyType === 'weekdays' && dayOfWeek !== 'sat' && dayOfWeek !== 'sun') return true;
            if (frequencyType === 'weekends' && (dayOfWeek === 'sat' || dayOfWeek === 'sun')) return true;

            // For weekly, we need to check the day property from the frequency object
            if (frequencyType === 'weekly') {
                let day = '';
                try {
                    if (typeof loop.frequency === 'string') {
                        try {
                            const parsed = JSON.parse(loop.frequency);
                            day = parsed.day || '';
                        } catch (e) {
                            // Not JSON, so no day specified
                        }
                    } else if (typeof loop.frequency === 'object' && loop.frequency !== null) {
                        day = (loop.frequency as any).day || '';
                    }

                    return day.toLowerCase() === dayOfWeek;
                } catch (e) {
                    return false;
                }
            }

            // For custom, we need to check the days array from the frequency object
            if (frequencyType === 'custom') {
                try {
                    let days: string[] = [];
                    if (typeof loop.frequency === 'string') {
                        try {
                            const parsed = JSON.parse(loop.frequency);
                            days = parsed.days || [];
                        } catch (e) {
                            // Not JSON, so no days specified
                        }
                    } else if (typeof loop.frequency === 'object' && loop.frequency !== null) {
                        days = (loop.frequency as any).days || [];
                    }

                    return days.some(d => d.toLowerCase() === dayOfWeek);
                } catch (e) {
                    return false;
                }
            }

            return false;
        });
    };

    const updateLoop = async (id: string, loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);

            // Add the type field to ensure it matches the required type in the LoopFormSheet
            const loopWithType = {
                ...loopData,
                type: 'loop' as const,
            };

            const success = await updateLoopService(id, loopWithType);

            if (success) {
                // Reload loops to get the updated state
                await loadLoops();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update loop:', err);
            setError('Failed to update loop');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteLoop = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);

            // Delete the loop record
            await executeSql('DELETE FROM loop_items WHERE loopId = ?', [id]);
            await executeSql('DELETE FROM loops WHERE id = ?', [id]);

            // Update state
            setLoops(prev => prev.filter(loop => loop.id !== id));

            return true;
        } catch (err) {
            console.error('Failed to delete loop:', err);
            setError('Failed to delete loop');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loops,
        loading,
        error,
        loadLoops,
        addLoop,
        getTodayLoops,
        updateLoop,
        deleteLoop
    };
}
