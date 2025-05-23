import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Action, SubAction } from '../../types/action';
import {
    getAllActions,
    createAction,
    updateAction,
    deleteAction,
    getActionsWithDueDate,
    getActionsByParent
} from '../../api/actionService';

interface ActionState {
    actions: Action[];
    loading: boolean;
    error: string | null;
}

const initialState: ActionState = {
    actions: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchActions = createAsyncThunk(
    'actions/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllActions();
        } catch (error) {
            console.error('Failed to load actions:', error);
            return rejectWithValue('Failed to load actions');
        }
    }
);

export const fetchUpcomingActions = createAsyncThunk(
    'actions/fetchUpcoming',
    async (_, { rejectWithValue }) => {
        try {
            return await getActionsWithDueDate();
        } catch (error) {
            console.error('Failed to load upcoming actions:', error);
            return rejectWithValue('Failed to load upcoming actions');
        }
    }
);

export const fetchActionsByParent = createAsyncThunk(
    'actions/fetchByParent',
    async ({ parentId, parentType }: { parentId: string; parentType: string }, { rejectWithValue }) => {
        try {
            return await getActionsByParent(parentId, parentType);
        } catch (error) {
            console.error('Failed to load actions by parent:', error);
            return rejectWithValue('Failed to load actions by parent');
        }
    }
);

export const addAction = createAsyncThunk(
    'actions/add',
    async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await createAction(action);
        } catch (error) {
            console.error('Failed to create action:', error);
            return rejectWithValue('Failed to create action');
        }
    }
);

export const updateActionThunk = createAsyncThunk(
    'actions/update',
    async ({ id, updates }: { id: string; updates: Partial<Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
        try {
            const success = await updateAction(id, updates);
            if (success) {
                return { id, updates };
            }
            return rejectWithValue('Failed to update action');
        } catch (error) {
            console.error('Failed to update action:', error);
            return rejectWithValue('Failed to update action');
        }
    }
);

export const removeAction = createAsyncThunk(
    'actions/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            const success = await deleteAction(id);
            if (success) {
                return id;
            }
            return rejectWithValue('Failed to delete action');
        } catch (error) {
            console.error('Failed to delete action:', error);
            return rejectWithValue('Failed to delete action');
        }
    }
);

export const toggleSubAction = createAsyncThunk(
    'actions/toggleSubAction',
    async ({ actionId, subActionId }: { actionId: string; subActionId: string }, { getState, dispatch, rejectWithValue }) => {
        try {
            const state = getState() as { action: ActionState };
            const action = state.action.actions.find(a => a.id === actionId);

            if (!action || !action.subActions) {
                return rejectWithValue('Action or subAction not found');
            }

            const subActions = [...(action.subActions || [])];
            const subActionIndex = subActions.findIndex(sa => sa.id === subActionId);

            if (subActionIndex === -1) {
                return rejectWithValue('SubAction not found');
            }

            // Toggle the done status
            const updatedSubActions = [...subActions];
            updatedSubActions[subActionIndex] = {
                ...updatedSubActions[subActionIndex],
                done: !updatedSubActions[subActionIndex].done
            };

            // Update the action
            dispatch(updateActionThunk({
                id: actionId,
                updates: { subActions: updatedSubActions }
            }));

            return { actionId, subActionId, updatedSubActions };
        } catch (error) {
            console.error('Failed to toggle subAction:', error);
            return rejectWithValue('Failed to toggle subAction');
        }
    }
);

const actionSlice = createSlice({
    name: 'action',
    initialState,
    reducers: {
        setActions: (state, action: PayloadAction<Action[]>) => {
            state.actions = action.payload;
        },
        clearActions: (state) => {
            state.actions = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all actions
            .addCase(fetchActions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActions.fulfilled, (state, action) => {
                state.actions = action.payload;
                state.loading = false;
            })
            .addCase(fetchActions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add action
            .addCase(addAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAction.fulfilled, (state, action) => {
                if (action.payload) {
                    const newAction = action.payload as unknown as Action;
                    state.actions.unshift(newAction);
                }
                state.loading = false;
            })
            .addCase(addAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update action
            .addCase(updateActionThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateActionThunk.fulfilled, (state, action) => {
                const { id, updates } = action.payload as { id: string; updates: Partial<Action> };
                state.actions = state.actions.map(action =>
                    action.id === id ? { ...action, ...updates } : action
                );
                state.loading = false;
            })
            .addCase(updateActionThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Remove action
            .addCase(removeAction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeAction.fulfilled, (state, action) => {
                state.actions = state.actions.filter(a => a.id !== action.payload);
                state.loading = false;
            })
            .addCase(removeAction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setActions, clearActions } = actionSlice.actions;

export default actionSlice.reducer; 