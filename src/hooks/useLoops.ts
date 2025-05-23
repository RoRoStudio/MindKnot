import { useEffect, useCallback, useState } from 'react';
import { Loop } from '../types/loop';
import { createLoop, getAllLoops, updateLoop as updateLoopService, getLoopById as getLoopByIdService } from '../api/loopService';

export function useLoops() {
    const [loops, setLoops] = useState<Loop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLoops = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const allLoops = await getAllLoops();
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

    useEffect(() => {
        loadLoops();
    }, [loadLoops]);

    const addLoop = useCallback(async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newLoop = await createLoop(loop);
            setLoops(prev => [...prev, newLoop]);
            return true;
        } catch (err) {
            console.error('Failed to create loop:', err);
            setError('Failed to create loop');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLoop = useCallback(async (id: string, updates: Partial<Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const updatesWithType = { ...updates };
            if (!updatesWithType.type) {
                updatesWithType.type = 'loop';
            }
            const success = await updateLoopService(id, updatesWithType as any);
            if (success) {
                await loadLoops();
            }
            return success;
        } catch (err) {
            console.error('Failed to update loop:', err);
            setError('Failed to update loop');
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadLoops]);

    const deleteLoop = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            setLoops(prev => prev.filter(loop => loop.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete loop:', err);
            setError('Failed to delete loop');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getLoopById = useCallback(async (id: string) => {
        try {
            return await getLoopByIdService(id);
        } catch (err) {
            console.error('Failed to get loop:', err);
            return null;
        }
    }, []);

    return {
        loops,
        loading,
        error,
        loadLoops,
        addLoop,
        updateLoop,
        deleteLoop,
        getLoopById
    };
}
