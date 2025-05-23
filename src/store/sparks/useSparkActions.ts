import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../shared';
import { Spark } from '../../types/spark';
import { getAllSparks as fetchSparks, createSpark, updateSpark, deleteSpark } from '../../api/sparkService';

export const useSparkActions = () => {
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSparks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const sparksData = await fetchSparks();
            setSparks(sparksData);
        } catch (err) {
            console.error('Error loading sparks:', err);
            setError('Failed to load sparks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSparks();
    }, [loadSparks]);

    const addSpark = useCallback(async (data: Omit<Spark, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newSparkId = await createSpark(data);
            await loadSparks(); // Reload to get the new spark
            return newSparkId;
        } catch (err) {
            console.error('Error creating spark:', err);
            setError('Failed to create spark');
            return null;
        } finally {
            setLoading(false);
        }
    }, [loadSparks]);

    const editSpark = useCallback(async (id: string, updates: Partial<Omit<Spark, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateSpark(id, updates);
            if (success) {
                await loadSparks();
            }
            return success;
        } catch (err) {
            console.error('Error updating spark:', err);
            setError('Failed to update spark');
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadSparks]);

    const removeSpark = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteSpark(id);
            if (success) {
                setSparks(prev => prev.filter(spark => spark.id !== id));
            }
            return success;
        } catch (err) {
            console.error('Error deleting spark:', err);
            setError('Failed to delete spark');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getSparkById = useCallback((id: string) => {
        const sparksArray = Array.isArray(sparks) ? sparks : [];
        return sparksArray.find((spark: Spark) => spark.id === id) || null;
    }, [sparks]);

    return {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark,
        editSpark,
        removeSpark,
        getSparkById
    };
}; 