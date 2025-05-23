// src/hooks/usePaths.ts
import { useEffect, useCallback, useState } from 'react';
import { Path } from '../types/path';
import { createPath, getAllPaths, updatePath as updatePathService, getPathById as getPathByIdService } from '../api/pathService';

export function usePaths() {
    const [paths, setPaths] = useState<Path[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPaths = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const allPaths = await getAllPaths();
            setPaths(allPaths);
            return allPaths;
        } catch (err) {
            console.error('Failed to load paths:', err);
            setError('Failed to load paths');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPaths();
    }, [loadPaths]);

    const addPath = useCallback(async (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newPath = await createPath(path);
            setPaths(prev => [...prev, newPath]);
            return true;
        } catch (err) {
            console.error('Failed to create path:', err);
            setError('Failed to create path');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePath = useCallback(async (id: string, updates: Partial<Omit<Path, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const updatesWithType = { ...updates };
            if (!updatesWithType.type) {
                updatesWithType.type = 'path';
            }
            const success = await updatePathService(id, updatesWithType as any);
            if (success) {
                await loadPaths();
            }
            return success;
        } catch (err) {
            console.error('Failed to update path:', err);
            setError('Failed to update path');
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadPaths]);

    const deletePath = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            setPaths(prev => prev.filter(path => path.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete path:', err);
            setError('Failed to delete path');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getPathById = useCallback(async (id: string) => {
        try {
            return await getPathByIdService(id);
        } catch (err) {
            console.error('Failed to get path:', err);
            return null;
        }
    }, []);

    return {
        paths,
        loading,
        error,
        loadPaths,
        addPath,
        updatePath,
        deletePath,
        getPathById
    };
}