// src/hooks/usePaths.ts
import { useState, useEffect, useCallback } from 'react';
import { Path } from '../types/path';
import { createPath, getAllPaths } from '../services/pathService';
import { useSagaStore } from '../state/sagaStore';

export function usePaths() {
    const [paths, setPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const selectedSagaId = useSagaStore(state => state.selectedSagaId);

    const loadPaths = useCallback(async () => {
        try {
            console.log('Loading paths...');
            setLoading(true);
            setError(null);
            const allPaths = await getAllPaths();
            console.log(`Loaded ${allPaths.length} paths`, allPaths);
            setPaths(allPaths);
            return allPaths;
        } catch (err) {
            console.error('Failed to load paths:', err);
            setError('Failed to load paths');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load paths when the component mounts
        loadPaths();
    }, [loadPaths]);

    const addPath = async (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newPath = await createPath(path);

            // Update the state with the new path
            setPaths(prev => [newPath, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create path:', err);
            setError('Failed to create path');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Get in-progress paths (with a start date but no end date or a future end date)
    const getActivePaths = () => {
        const now = new Date();

        return paths.filter(path => {
            const startDate = path.startDate ? new Date(path.startDate) : null;
            const targetDate = path.targetDate ? new Date(path.targetDate) : null;

            // Path is active if it has started and hasn't reached its target date
            return (startDate && startDate <= now) &&
                (!targetDate || targetDate >= now);
        });
    };

    return {
        paths,
        loading,
        error,
        loadPaths,
        addPath,
        getActivePaths
    };
}