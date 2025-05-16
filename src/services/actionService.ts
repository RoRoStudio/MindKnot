// src/services/actionService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Action, SubAction } from '../types/action';

export const createAction = async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Action> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO actions (
            id, title, tags, body, description, done, completed, priority, dueDate, subActions, parentId, parentType,
            createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            action.title,
            action.tags ? JSON.stringify(action.tags) : null,
            action.body,
            action.description,
            action.done ? 1 : 0,
            action.completed ? 1 : 0,
            action.priority,
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
        tags: action.tags || [],
        body: action.body,
        description: action.description,
        done: action.done,
        completed: action.completed,
        priority: action.priority,
        dueDate: action.dueDate,
        subActions: action.subActions || [],
        parentId: action.parentId,
        parentType: action.parentType,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllActions = async (): Promise<Action[]> => {
    const result = await executeSql(
        'SELECT * FROM actions ORDER BY createdAt DESC',
        []
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            completed: Boolean(row.completed),
            priority: row.priority || 2, // Default priority if not set
            description: row.description || '', // Default empty string if not set
            type: 'action'
        })) as Action[];
    }

    return [];
};

export const getActionById = async (id: string): Promise<Action | null> => {
    const result = await executeSql(
        'SELECT * FROM actions WHERE id = ?',
        [id]
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        const row = result.rows._array[0];
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
            completed: Boolean(row.completed),
            priority: row.priority || 2, // Default priority if not set
            description: row.description || '', // Default empty string if not set
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
            `UPDATE actions SET 
                title = ?, 
                body = ?,
                description = ?, 
                tags = ?,
                done = ?,
                completed = ?,
                priority = ?,
                dueDate = ?,
                subActions = ?,
                parentId = ?,
                parentType = ?,
                updatedAt = ?
             WHERE id = ?`,
            [
                updatedAction.title,
                updatedAction.body,
                updatedAction.description,
                updatedAction.tags ? JSON.stringify(updatedAction.tags) : null,
                updatedAction.done ? 1 : 0,
                updatedAction.completed ? 1 : 0,
                updatedAction.priority,
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
        await executeSql('DELETE FROM actions WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting action:', error);
        return false;
    }
};

export const getActionsWithDueDate = async (): Promise<Action[]> => {
    const result = await executeSql(
        `SELECT * FROM actions 
         WHERE dueDate IS NOT NULL
         AND dueDate != ''
         AND done = 0
         ORDER BY dueDate ASC`,
        []
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
        `SELECT * FROM actions 
         WHERE parentId = ?
         AND parentType = ?
         ORDER BY createdAt DESC`,
        [parentId, parentType]
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