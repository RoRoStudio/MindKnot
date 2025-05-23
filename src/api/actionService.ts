// src/api/actionService.ts
import { executeSql } from './database';
import { generateUUID } from '../utils/uuidUtil';
import { Action, SubAction } from '../types/action';

export const createAction = async (action: Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    // Handle the case where subTasks is provided but subActions is not
    let subActionsData = action.subActions ? JSON.stringify(action.subActions) : null;
    if (!subActionsData && action.subTasks) {
        // Convert subTasks to the subActions format expected by the database
        const convertedSubActions = action.subTasks.map(task => ({
            id: task.id,
            text: task.text,
            done: task.completed
        }));
        subActionsData = JSON.stringify(convertedSubActions);
    }

    try {
        // First check if the categoryId column exists
        const columnsResult = await executeSql(`PRAGMA table_info(actions)`);
        const columns = columnsResult.rows._array;
        const columnNames = columns.map((col: any) => col.name);

        console.log('Creating action with available columns:', columnNames);

        // Dynamically build the SQL statement based on available columns
        let sql = `INSERT INTO actions (id, title, tags, body`;
        // Use an array of any type to avoid TypeScript errors
        let values: any[] = [id, action.title, action.tags ? JSON.stringify(action.tags) : null, action.body || null];
        let placeholders = '?, ?, ?, ?';

        if (columnNames.includes('description')) {
            sql += ', description';
            values.push(action.description || '');
            placeholders += ', ?';
        }

        if (columnNames.includes('done')) {
            sql += ', done';
            values.push(action.done ? 1 : 0);
            placeholders += ', ?';
        }

        if (columnNames.includes('completed')) {
            sql += ', completed';
            values.push(action.completed ? 1 : 0);
            placeholders += ', ?';
        }

        if (columnNames.includes('priority')) {
            sql += ', priority';
            values.push(action.priority || 0);
            placeholders += ', ?';
        }

        if (columnNames.includes('dueDate')) {
            sql += ', dueDate';
            values.push(action.dueDate || null);
            placeholders += ', ?';
        }

        if (columnNames.includes('subActions')) {
            sql += ', subActions';
            values.push(subActionsData);
            placeholders += ', ?';
        }

        if (columnNames.includes('parentId')) {
            sql += ', parentId';
            values.push(action.parentId || null);
            placeholders += ', ?';
        }

        if (columnNames.includes('parentType')) {
            sql += ', parentType';
            values.push(action.parentType || null);
            placeholders += ', ?';
        }

        // Always include creation timestamps
        sql += ', createdAt, updatedAt';
        values.push(now, now);
        placeholders += ', ?, ?';

        // Only include categoryId if the column exists
        if (columnNames.includes('categoryId')) {
            sql += ', categoryId';
            values.push(action.categoryId || null);
            placeholders += ', ?';
        }

        // Add starred field support
        if (columnNames.includes('starred')) {
            sql += ', starred';
            values.push((action as any).isStarred ? 1 : 0);
            placeholders += ', ?';
        }

        // Add hidden field support
        if (columnNames.includes('hidden')) {
            sql += ', hidden';
            values.push(false ? 1 : 0); // Default to not hidden
            placeholders += ', ?';
        }

        sql += `) VALUES (${placeholders})`;

        await executeSql(sql, values);
        return id;
    } catch (error) {
        console.error('Error creating action:', error);
        throw error;
    }
};

export const getAllActions = async (): Promise<Action[]> => {
    const result = await executeSql(
        'SELECT * FROM actions WHERE hidden = 0 OR hidden IS NULL ORDER BY createdAt DESC',
        []
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => {
            // Parse JSON fields
            const tags = row.tags ? JSON.parse(row.tags) : [];
            const subActions = row.subActions ? JSON.parse(row.subActions) : [];

            // Convert subActions to subTasks format for component consumption
            const subTasks = (subActions && Array.isArray(subActions)) ? subActions.map((subAction: any) => ({
                id: subAction.id,
                text: subAction.text,
                completed: subAction.done
            })) : [];

            return {
                ...row,
                tags,
                subActions,
                subTasks,
                done: Boolean(row.done),
                completed: Boolean(row.completed),
                priority: row.priority || 0,
                description: row.description || '',
                isStarred: Boolean(row.starred),
                type: 'action'
            };
        }) as Action[];
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

        // Parse JSON fields
        const tags = row.tags ? JSON.parse(row.tags) : [];
        const subActions = row.subActions ? JSON.parse(row.subActions) : [];

        // Convert subActions to subTasks format for component consumption
        const subTasks = (subActions && Array.isArray(subActions)) ? subActions.map((subAction: any) => ({
            id: subAction.id,
            text: subAction.text,
            completed: subAction.done
        })) : [];

        return {
            ...row,
            tags,
            subActions,
            subTasks,
            done: Boolean(row.done),
            completed: Boolean(row.completed),
            priority: row.priority || 0,
            description: row.description || '',
            isStarred: Boolean(row.starred),
            type: 'action'
        } as Action;
    }

    return null;
};

export const updateAction = async (id: string, updates: Partial<Omit<Action, 'id' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    const now = new Date().toISOString();
    const current = await getActionById(id);

    if (!current) return false;

    // Handle the case where subTasks is provided but subActions is not
    let subActionsData = updates.subActions;
    if (!subActionsData && updates.subTasks) {
        // Convert subTasks to the subActions format expected by the database
        subActionsData = updates.subTasks.map(task => ({
            id: task.id,
            text: task.text,
            done: task.completed
        }));
    }

    try {
        // First check if the categoryId column exists
        const columnsResult = await executeSql(`PRAGMA table_info(actions)`);
        const columns = columnsResult.rows._array;
        const columnNames = columns.map((col: any) => col.name);

        console.log('Updating action with available columns:', columnNames);

        // Dynamically build the SQL statement based on available columns
        let sql = `UPDATE actions SET title = ?, body = ?`;
        // Use an array of any type to avoid TypeScript errors
        let values: any[] = [
            updates.title !== undefined ? updates.title : current.title,
            updates.body !== undefined ? updates.body : current.body || null
        ];

        if (columnNames.includes('description')) {
            sql += ', description = ?';
            values.push(updates.description !== undefined ? updates.description : current.description || '');
        }

        if (columnNames.includes('tags')) {
            sql += ', tags = ?';
            const tags = updates.tags !== undefined ? updates.tags : current.tags;
            values.push(tags ? JSON.stringify(tags) : null);
        }

        if (columnNames.includes('done')) {
            sql += ', done = ?';
            values.push(updates.done !== undefined ? (updates.done ? 1 : 0) : (current.done ? 1 : 0));
        }

        if (columnNames.includes('completed')) {
            sql += ', completed = ?';
            values.push(updates.completed !== undefined ? (updates.completed ? 1 : 0) : (current.completed ? 1 : 0));
        }

        if (columnNames.includes('priority')) {
            sql += ', priority = ?';
            values.push(updates.priority !== undefined ? updates.priority : (current.priority || 0));
        }

        if (columnNames.includes('dueDate')) {
            sql += ', dueDate = ?';
            values.push(updates.dueDate !== undefined ? updates.dueDate : current.dueDate || null);
        }

        if (columnNames.includes('subActions')) {
            sql += ', subActions = ?';
            const finalSubActions = subActionsData || current.subActions;
            values.push(finalSubActions ? JSON.stringify(finalSubActions) : null);
        }

        if (columnNames.includes('parentId')) {
            sql += ', parentId = ?';
            values.push(updates.parentId !== undefined ? updates.parentId : current.parentId || null);
        }

        if (columnNames.includes('parentType')) {
            sql += ', parentType = ?';
            values.push(updates.parentType !== undefined ? updates.parentType : current.parentType || null);
        }

        // Always update the updatedAt timestamp
        sql += ', updatedAt = ?';
        values.push(now);

        // Only include categoryId if the column exists
        if (columnNames.includes('categoryId')) {
            sql += ', categoryId = ?';
            values.push(updates.categoryId !== undefined ? updates.categoryId : current.categoryId || null);
        }

        // Add starred field support
        if (columnNames.includes('starred')) {
            sql += ', starred = ?';
            const starredValue = (updates as any).starred !== undefined ? (updates as any).starred : current.isStarred;
            values.push(starredValue ? 1 : 0);
        }

        // Add hidden field support
        if (columnNames.includes('hidden')) {
            sql += ', hidden = ?';
            values.push((updates as any).hidden ? 1 : 0);
        }

        sql += ` WHERE id = ?`;
        values.push(id);

        await executeSql(sql, values);
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
        return result.rows._array.map((row: any) => {
            // Parse JSON fields
            const tags = row.tags ? JSON.parse(row.tags) : [];
            const subActions = row.subActions ? JSON.parse(row.subActions) : [];

            // Convert subActions to subTasks format for component consumption
            const subTasks = (subActions && Array.isArray(subActions)) ? subActions.map((subAction: any) => ({
                id: subAction.id,
                text: subAction.text,
                completed: subAction.done
            })) : [];

            return {
                ...row,
                tags,
                subActions,
                subTasks,
                done: Boolean(row.done),
                completed: Boolean(row.completed),
                type: 'action'
            };
        }) as Action[];
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
        return result.rows._array.map((row: any) => {
            // Parse JSON fields
            const tags = row.tags ? JSON.parse(row.tags) : [];
            const subActions = row.subActions ? JSON.parse(row.subActions) : [];

            // Convert subActions to subTasks format for component consumption
            const subTasks = (subActions && Array.isArray(subActions)) ? subActions.map((subAction: any) => ({
                id: subAction.id,
                text: subAction.text,
                completed: subAction.done
            })) : [];

            return {
                ...row,
                tags,
                subActions,
                subTasks,
                done: Boolean(row.done),
                completed: Boolean(row.completed),
                type: 'action'
            };
        }) as Action[];
    }

    return [];
};