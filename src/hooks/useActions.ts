// src/hooks/useActions.ts
import { useCallback, useEffect } from 'react';
import { useActionActions } from '../redux/hooks/stateHooks';

export function useActions() {
    const {
        actions,
        loading,
        error,
        loadActions,
        addAction,
        updateAction: editAction,
        deleteAction: removeAction,
        toggleActionDone,
        toggleSubActionDone,
        getActionById
    } = useActionActions();

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    const loadUpcomingActions = useCallback(async () => {
        try {
            // Filter actions to get only those with due dates
            return actions.filter(action => action.dueDate);
        } catch (err) {
            console.error('Failed to load upcoming actions:', err);
            return [];
        }
    }, [actions]);

    const loadActionsByParent = useCallback(async (parentId: string, parentType: string) => {
        try {
            // Filter actions to get only those with matching parent
            return actions.filter(action =>
                action.parentId === parentId && action.parentType === parentType
            );
        } catch (err) {
            console.error('Failed to load actions by parent:', err);
            return [];
        }
    }, [actions]);

    return {
        actions,
        loading,
        error,
        loadActions,
        addAction,
        editAction,
        removeAction,
        loadUpcomingActions,
        loadActionsByParent,
        toggleActionDone
    };
}