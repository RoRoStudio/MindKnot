import { RootState } from '../../store/shared/store';

export const selectActions = (state: RootState) => state.action.actions;
export const selectActionLoading = (state: RootState) => state.action.loading;
export const selectActionError = (state: RootState) => state.action.error;

// Helper selector to get a specific action by id
export const selectActionById = (id: string) => (state: RootState) =>
    state.action.actions.find(action => action.id === id);

// Helper selector to get all pending actions (not done yet)
export const selectPendingActions = (state: RootState) =>
    state.action.actions.filter(action => !action.done);

// Helper selector to get all completed actions
export const selectCompletedActions = (state: RootState) =>
    state.action.actions.filter(action => action.done); 