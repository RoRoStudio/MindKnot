import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import {
    fetchActions,
    addAction,
    updateActionThunk,
    removeAction,
    toggleSubAction
} from './actionSlice';
import {
    selectActions,
    selectActionError,
    selectActionLoading,
    selectActionById
} from './actionSelectors';
import { Action, SubAction } from '../../../shared/types/action';

export const useActionActions = () => {
    const dispatch = useAppDispatch();
    const actions = useAppSelector(selectActions);
    const loading = useAppSelector(selectActionLoading);
    const error = useAppSelector(selectActionError);

    // Load all actions
    const loadActions = useCallback(async () => {
        const resultAction = await dispatch(fetchActions());
        if (fetchActions.fulfilled.match(resultAction)) {
            return resultAction.payload;
        }
        return [];
    }, [dispatch]);

    // Add a new action
    const addNewAction = useCallback(async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        const resultAction = await dispatch(addAction(action));
        return addAction.fulfilled.match(resultAction);
    }, [dispatch]);

    // Update an existing action
    const updateExistingAction = useCallback(async (id: string, updates: Partial<Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        const resultAction = await dispatch(updateActionThunk({ id, updates }));
        return updateActionThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    // Delete an action
    const deleteAction = useCallback(async (id: string) => {
        const resultAction = await dispatch(removeAction(id));
        return removeAction.fulfilled.match(resultAction);
    }, [dispatch]);

    // Toggle action done status
    const toggleActionDone = useCallback(async (id: string) => {
        const action = actions.find(a => a.id === id);
        if (!action) return false;

        const resultAction = await dispatch(updateActionThunk({
            id,
            updates: { done: !action.done }
        }));
        return updateActionThunk.fulfilled.match(resultAction);
    }, [dispatch, actions]);

    // Toggle sub-action done status
    const toggleSubActionDone = useCallback(async (actionId: string, subActionId: string) => {
        const resultAction = await dispatch(toggleSubAction({ actionId, subActionId }));
        return toggleSubAction.fulfilled.match(resultAction);
    }, [dispatch]);

    // Get a specific action by ID
    const getActionById = useCallback((id: string) => {
        return actions.find(action => action.id === id) || null;
    }, [actions]);

    return {
        actions,
        loading,
        error,
        loadActions,
        addAction: addNewAction,
        updateAction: updateExistingAction,
        deleteAction,
        toggleActionDone,
        toggleSubActionDone,
        getActionById
    };
}; 