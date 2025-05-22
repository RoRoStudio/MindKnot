import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import {
    fetchSparks,
    addSpark,
    updateSparkThunk,
    removeSpark
} from '../slices/sparkSlice';
import {
    selectSparks,
    selectSparkLoading,
    selectSparkError,
    selectSparkById
} from '../selectors/sparkSelectors';
import { Spark } from '../../types/spark';

export const useSparkActions = () => {
    const dispatch = useAppDispatch();
    const sparks = useAppSelector(selectSparks);
    const loading = useAppSelector(selectSparkLoading);
    const error = useAppSelector(selectSparkError);

    // Load all sparks
    const loadSparks = useCallback(async () => {
        const resultAction = await dispatch(fetchSparks());
        if (fetchSparks.fulfilled.match(resultAction)) {
            return resultAction.payload;
        }
        return [];
    }, [dispatch]);

    // Add a new spark
    const addNewSpark = useCallback(async (spark: Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        const resultAction = await dispatch(addSpark(spark));
        return addSpark.fulfilled.match(resultAction);
    }, [dispatch]);

    // Update an existing spark
    const updateExistingSpark = useCallback(async (id: string, updates: Partial<Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        const resultAction = await dispatch(updateSparkThunk({ id, updates }));
        return updateSparkThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    // Delete a spark
    const deleteSpark = useCallback(async (id: string) => {
        const resultAction = await dispatch(removeSpark(id));
        return removeSpark.fulfilled.match(resultAction);
    }, [dispatch]);

    // Get a specific spark by ID
    const getSparkById = useCallback((id: string) => {
        return sparks.find(spark => spark.id === id) || null;
    }, [sparks]);

    return {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark: addNewSpark,
        updateSpark: updateExistingSpark,
        deleteSpark,
        getSparkById
    };
}; 