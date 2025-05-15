// src/hooks/useLoops.ts
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
            setLoading(true);
            setError(null);

            const targetSagaId = sagaId || selectedSagaId;
            const allLoops = await getAllLoops();
            setLoops(allLoops);

        } catch (err) {
            console.error('Failed to load loops:', err);
            setError('Failed to load loops');
        } finally {
            setLoading(false);
        }
    }, [selectedSagaId]);

    useEffect(() => {
        if (selectedSagaId) {
            loadLoops();
        }
    }, [selectedSagaId, loadLoops]);

    const addLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            await createLoop(loop);
            await loadLoops();
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
            const frequency = typeof loop.frequency === 'string' ?
                JSON.parse(loop.frequency) : loop.frequency;

            if (frequency.type === 'daily') return true;
            if (frequency.type === 'weekdays' && dayOfWeek !== 'sat' && dayOfWeek !== 'sun') return true;
            if (frequency.type === 'weekends' && (dayOfWeek === 'sat' || dayOfWeek === 'sun')) return true;
            if (frequency.type === 'weekly' && frequency.day === dayOfWeek) return true;
            if (frequency.type === 'custom' && frequency.days && frequency.days.includes(dayOfWeek)) return true;

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