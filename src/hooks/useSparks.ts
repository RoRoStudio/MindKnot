// src/hooks/useSparks.ts
import { useEffect } from 'react';
import { useSparkActions } from '../store/sparks/useSparkActions';

export function useSparks() {
    const {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark,
        editSpark: updateSpark,
        removeSpark: deleteSpark,
        getSparkById
    } = useSparkActions();

    useEffect(() => {
        loadSparks();
    }, [loadSparks]);

    return {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark,
        updateSpark,
        deleteSpark,
        getSparkById
    };
}