import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../shared';

// This hook mimics the previous Zustand API to make migration easier
export const useSagaActions = () => {
    const [selectedSagaId, setSelectedSagaIdState] = useState<string | null>(null);

    const setSelectedSaga = useCallback((sagaId: string | null) => {
        setSelectedSagaIdState(sagaId);
    }, []);

    return {
        selectedSagaId,
        setSelectedSaga
    };
}; 