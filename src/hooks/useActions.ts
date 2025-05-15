// src/hooks/useActions.ts
import { useState, useEffect, useCallback } from 'react';
import { Action } from '../types/action';
import {
    createAction,
    getAllActions,
    updateAction,
    deleteAction,
    getActionsWithDueDate,
    getActionsByParent
} from '../services/actionService';

export function useActions() {
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadActions = useCallback(async () => {
        try {
            console.log('Loading actions...');
            setLoading(true);
            setError(null);
            const allActions = await getAllActions();
            console.log(`Loaded ${allActions.length} actions`, allActions);
            setActions(allActions);
            return allActions;
        } catch (err) {
            console.error('Failed to load actions:', err);
            setError('Failed to load actions');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadActions();
    }, [loadActions]);

    const addAction = async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newAction = await createAction(action);

            // Update the state with the new action
            setActions(prev => [newAction, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create action:', err);
            setError('Failed to create action');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editAction = async (id: string, updates: Partial<Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateAction(id, updates);

            if (success) {
                // Update the local state
                setActions(prev => prev.map(action =>
                    action.id === id ? { ...action, ...updates } : action
                ));
            }

            return success;
        } catch (err) {
            console.error('Failed to update action:', err);
            setError('Failed to update action');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeAction = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteAction(id);

            if (success) {
                // Remove the action from the local state
                setActions(prev => prev.filter(action => action.id !== id));
            }

            return success;
        } catch (err) {
            console.error('Failed to delete action:', err);
            setError('Failed to delete action');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const loadUpcomingActions = async () => {
        try {
            setLoading(true);
            setError(null);
            const upcomingActions = await getActionsWithDueDate();
            return upcomingActions;
        } catch (err) {
            console.error('Failed to load upcoming actions:', err);
            setError('Failed to load upcoming actions');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const loadActionsByParent = async (parentId: string, parentType: string) => {
        try {
            setLoading(true);
            setError(null);
            const parentActions = await getActionsByParent(parentId, parentType);
            return parentActions;
        } catch (err) {
            console.error('Failed to load actions by parent:', err);
            setError('Failed to load actions by parent');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const toggleActionDone = async (id: string) => {
        const actionToToggle = actions.find(a => a.id === id);
        if (!actionToToggle) return false;

        return await editAction(id, { done: !actionToToggle.done });
    };

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