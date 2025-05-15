import { useState, useEffect, useCallback } from 'react';
import { Loop } from '../types/loop';
import { createLoop, getAllLoops } from '../services/loopService';
import { useSagaStore } from '../state/sagaStore';

export function useLoops() {
    const [loops, setLoops] = useState<Loop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const selectedSagaId = useSagaStore(state => state.selectedSagaId);

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

            let frequencyObj;

            try {
                if (typeof loop.frequency === 'string') {
                    // Check if it's a simple string frequency
                    if (loop.frequency === 'daily' ||
                        loop.frequency === 'weekdays' ||
                        loop.frequency === 'weekends' ||
                        loop.frequency === 'weekly') {
                        frequencyObj = { type: loop.frequency };
                    } else {
                        // Try to parse as JSON
                        try {
                            frequencyObj = JSON.parse(loop.frequency);
                        } catch (e) {
                            // If not valid JSON, treat as simple string value
                            frequencyObj = { type: loop.frequency };
                        }
                    }
                } else {
                    frequencyObj = loop.frequency;
                }
            } catch (e) {
                console.error('Error processing frequency:', e, loop.frequency);
                return true; // Show the loop if we can't process the frequency
            }

            if (frequencyObj.type === 'daily') return true;
            if (frequencyObj.type === 'weekdays' && dayOfWeek !== 'sat' && dayOfWeek !== 'sun') return true;
            if (frequencyObj.type === 'weekends' && (dayOfWeek === 'sat' || dayOfWeek === 'sun')) return true;
            if (frequencyObj.type === 'weekly' && frequencyObj.day === dayOfWeek) return true;
            if (frequencyObj.type === 'custom' && frequencyObj.days && frequencyObj.days.includes(dayOfWeek)) return true;

            return false;
        });
    };

    return {
        loops,
        loading,
        error,
        loadLoops,
        addLoop,
        getTodayLoops
    };
}
