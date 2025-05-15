// src/services/actionService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Action, SubAction } from '../types/action';

// Temporary function for migration
export const migrateActionsFromCaptures = async (): Promise<void> => {
    // Fetch all captures with subType ACTION
    const result = await executeSql(
        'SELECT * FROM captures WHERE subType = ?',
        ['action']
    );

    if (!result || !result.rows || !result.rows._array) {
        console.log('No actions to migrate');
        return;
    }

    // Process each action capture and update type
    for (const capture of result.rows._array) {
        await executeSql(
            `UPDATE captures SET 
                type = ?, 
                subType = NULL,
                sagaId = NULL, 
                chapterId = NULL
             WHERE id = ?`,
            ['action', capture.id]
        );
    }

    console.log(`Migrated ${result.rows._array.length} actions from captures`);
};

export const createAction = async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Action> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO captures (
            id, type, title, tags, body, done, dueDate, subActions, parentId, parentType,
            createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            'action',
            action.title,
            action.tags ? JSON.stringify(action.tags) : null,
            action.body,
            action.done ? 1 : 0,
            action.dueDate || null,
            action.subActions ? JSON.stringify(action.subActions) : null,
            action.parentId || null,
            action.parentType || null,
            now,
            now,
        ]
    );

    return {
        id,
        type: 'action',
        title: action.title,
        tags: action.tags,
        body: action.body,
        done: action.done,
        dueDate: action.dueDate,
        subActions: action.subActions,
        parentId: action.parentId,
        parentType: action.parentType,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllActions = async (): Promise<Action[]> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE type = ? ORDER BY createdAt DESC',
        ['action']
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            type: 'action'
        })) as Action[];
    }

    return [];
};

export const getActionById = async (id: string): Promise<Action | null> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE id = ? AND type = ?',
        [id, 'action']
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        const row = result.rows._array[0];
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            type: 'action'
        } as Action;
    }

    return null;
};

export const updateAction = async (id: string, updates: Partial<Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    const now = new Date().toISOString();
    const current = await getActionById(id);

    if (!current) return false;

    const updatedAction = {
        ...current,
        ...updates,
        updatedAt: now
    };

    try {
        await executeSql(
            `UPDATE captures SET 
                title = ?, 
                body = ?, 
                tags = ?,
                done = ?,
                dueDate = ?,
                subActions = ?,
                parentId = ?,
                parentType = ?,
                updatedAt = ?
             WHERE id = ?`,
            [
                updatedAction.title,
                updatedAction.body,
                updatedAction.tags ? JSON.stringify(updatedAction.tags) : null,
                updatedAction.done ? 1 : 0,
                updatedAction.dueDate || null,
                updatedAction.subActions ? JSON.stringify(updatedAction.subActions) : null,
                updatedAction.parentId || null,
                updatedAction.parentType || null,
                now,
                id
            ]
        );
        return true;
    } catch (error) {
        console.error('Error updating action:', error);
        return false;
    }
};

export const deleteAction = async (id: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM captures WHERE id = ? AND type = ?', [id, 'action']);
        return true;
    } catch (error) {
        console.error('Error deleting action:', error);
        return false;
    }
};

export const getActionsWithDueDate = async (): Promise<Action[]> => {
    const now = new Date().toISOString();

    const result = await executeSql(
        `SELECT * FROM captures 
         WHERE type = ? 
         AND dueDate IS NOT NULL
         AND dueDate != ''
         AND done = 0
         ORDER BY dueDate ASC`,
        ['action']
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            type: 'action'
        })) as Action[];
    }

    return [];
};

export const getActionsByParent = async (parentId: string, parentType: string): Promise<Action[]> => {
    const result = await executeSql(
        `SELECT * FROM captures 
         WHERE type = ? 
         AND parentId = ?
         AND parentType = ?
         ORDER BY createdAt DESC`,
        ['action', parentId, parentType]
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            type: 'action'
        })) as Action[];
    }

    return [];
};