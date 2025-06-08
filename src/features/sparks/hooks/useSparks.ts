// src/hooks/useSparks.ts
import { useEffect } from 'react';
import { useSparkActions } from '../store/useSparkActions';

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

    // Remove redundant useEffect - let the parent component handle when to load

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