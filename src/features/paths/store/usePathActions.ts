import { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Path } from '../../../shared/types/path';

// Interface for draft state
interface PathDraft extends Partial<Path> { }

export const usePathActions = () => {
    const [draft, setDraftState] = useState<PathDraft>({});

    const setDraft = useCallback((updates: Partial<PathDraft>) => {
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

export const usePathDraft = usePathActions; 