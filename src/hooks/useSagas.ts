// src/hooks/useSagas.ts
import { useState, useEffect, useCallback } from 'react';
import { Saga } from '../types/saga';
import { getAllSagas, createSaga } from '../services/sagaService';
import { useSagaStore } from '../state/sagaStore';
import { IconName } from '../components/common';

export function useSagas() {
    const [sagas, setSagas] = useState<Saga[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { selectedSagaId, setSelectedSaga } = useSagaStore();

    const loadSagas = useCallback(async () => {
        try {
            console.log('Loading sagas...');
            setLoading(true);
            setError(null);
            const allSagas = await getAllSagas();
            console.log(`Loaded ${allSagas.length} sagas`, allSagas);
            setSagas(allSagas);
            return allSagas;
        } catch (err) {
            console.error('Failed to load sagas:', err);
            setError('Failed to load sagas');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSagas();
    }, [loadSagas]);

    const addSaga = async (name: string, icon: IconName) => {
        try {
            setLoading(true);
            setError(null);
            const newSaga = await createSaga(name, icon);
            await loadSagas();
            return newSaga;
        } catch (err) {
            console.error('Failed to create saga:', err);
            setError('Failed to create saga');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getSelectedSaga = useCallback(() => {
        return sagas.find(saga => saga.id === selectedSagaId) || null;
    }, [sagas, selectedSagaId]);

    return {
        sagas,
        loading,
        error,
        loadSagas,
        addSaga,
        selectedSagaId,
        setSelectedSaga,
        getSelectedSaga
    };
}