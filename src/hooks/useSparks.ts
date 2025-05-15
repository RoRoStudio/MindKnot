// src/hooks/useSparks.ts
import { useState, useEffect, useCallback } from 'react';
import { Spark } from '../types/spark';
import { createSpark, getAllSparks, updateSpark, deleteSpark, getUnlinkedSparks } from '../services/sparkService';

export function useSparks() {
    const [sparks, setSparks] = useState<Spark[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSparks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const allSparks = await getAllSparks();
            setSparks(allSparks);
        } catch (err) {
            console.error('Failed to load sparks:', err);
            setError('Failed to load sparks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSparks();
    }, [loadSparks]);

    const addSpark = async (spark: Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newSpark = await createSpark(spark);

            // Update the state with the new spark
            setSparks(prev => [newSpark, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create spark:', err);
            setError('Failed to create spark');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editSpark = async (id: string, updates: Partial<Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateSpark(id, updates);

            if (success) {
                // Update the local state
                setSparks(prev => prev.map(spark => 
                    spark.id === id ? { ...spark, ...updates } : spark
                ));
            }

            return success;
        } catch (err) {
            console.error('Failed to update spark:', err);
            setError('Failed to update spark');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeSpark = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteSpark(id);

            if (success) {
                // Remove the spark from the local state
                setSparks(prev => prev.filter(spark => spark.id !== id));
            }

            return success;
        } catch (err) {
            console.error('Failed to delete spark:', err);
            setError('Failed to delete spark');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loadUnlinkedSparks = async () => {
        try {
            setLoading(true);
            setError(null);
            const unlinkedSparks = await getUnlinkedSparks();
            
            // We can choose to set these to state or just return them
            return unlinkedSparks;
        } catch (err) {
            console.error('Failed to load unlinked sparks:', err);
            setError('Failed to load unlinked sparks');
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark,
        editSpark,
        removeSpark,
        loadUnlinkedSparks
    };
}