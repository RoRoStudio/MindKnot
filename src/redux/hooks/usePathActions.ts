import { useAppDispatch, useAppSelector } from './index';
import { setDraft, resetDraft } from '../slices/pathSlice';
import { selectPathDraft } from '../selectors/pathSelectors';
import { Milestone } from '../../types/path';

interface PathDraft {
    title?: string;
    description?: string;
    startDate?: string;
    targetDate?: string;
    milestones: Milestone[];
}

// This hook mimics the previous Zustand API to make migration easier
export const usePathActions = () => {
    const dispatch = useAppDispatch();
    const draft = useAppSelector(selectPathDraft);

    return {
        draft,
        setDraft: (updates: Partial<PathDraft>) => dispatch(setDraft(updates)),
        resetDraft: () => dispatch(resetDraft()),
    };
}; 