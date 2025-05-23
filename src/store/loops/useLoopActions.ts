import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../shared';
import { Loop } from '../../types/loop';

// Interface for draft state
interface LoopDraft extends Partial<Loop> { }

export const useLoopActions = () => {
    const [draft, setDraftState] = useState<LoopDraft>({});

    const setDraft = useCallback((updates: Partial<LoopDraft>) => {
        setDraftState(prev => ({ ...prev, ...updates }));
        return true;
    }, []);

    const resetDraft = useCallback(() => {
        setDraftState({});
        return true;
    }, []);

    return {
        draft,
        setDraft,
        resetDraft
    };
};

export const useLoopDraft = useLoopActions; 