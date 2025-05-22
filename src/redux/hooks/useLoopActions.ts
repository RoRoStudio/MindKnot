import { useAppDispatch, useAppSelector } from './index';
import { setDraft, resetDraft } from '../slices/loopSlice';
import { selectLoopDraft } from '../selectors/loopSelectors';
import { LoopItem } from '../../types/loop';

interface LoopDraft {
    title?: string;
    description?: string;
    frequency?: string;
    startTimeByDay?: Record<string, string>;
    items: LoopItem[];
}

// This hook mimics the previous Zustand API to make migration easier
export const useLoopActions = () => {
    const dispatch = useAppDispatch();
    const draft = useAppSelector(selectLoopDraft);

    return {
        draft,
        setDraft: (updates: Partial<LoopDraft>) => dispatch(setDraft(updates)),
        resetDraft: () => dispatch(resetDraft()),
    };
}; 