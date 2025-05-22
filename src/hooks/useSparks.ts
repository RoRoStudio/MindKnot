// src/hooks/useSparks.ts
import { useEffect } from 'react';
import { useSparkActions } from '../redux/hooks/stateHooks';

export function useSparks() {
    const {
        sparks,
        loading,
        error,
        loadSparks,
        addSpark,
        updateSpark: editSpark,
        deleteSpark: removeSpark,
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
        editSpark,
        removeSpark
    };
}