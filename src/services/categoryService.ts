// src/services/categoryService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Category } from '../types/category';

export const createCategory = async (title: string, color: string): Promise<Category> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        'INSERT INTO categories (id, title, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, title, color, now, now]
    );

    return {
        id,
        title,
        color,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllCategories = async (): Promise<Category[]> => {
    const result = await executeSql(
        'SELECT * FROM categories ORDER BY title ASC',
        []
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array as Category[];
    }

    return [];
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    if (!id) return null;

    const result = await executeSql(
        'SELECT * FROM categories WHERE id = ?',
        [id]
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        return result.rows._array[0] as Category;
    }

    return null;
};

export const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    const now = new Date().toISOString();
    const current = await getCategoryById(id);

    if (!current) return false;

    try {
        await executeSql(
            'UPDATE categories SET title = ?, color = ?, updatedAt = ? WHERE id = ?',
            [
                updates.title ?? current.title,
                updates.color ?? current.color,
                now,
                id
            ]
        );
        return true;
    } catch (error) {
        console.error('Error updating category:', error);
        return false;
    }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
    try {
        // First, update all entries that use this category to remove the reference
        await executeSql('UPDATE notes SET categoryId = NULL WHERE categoryId = ?', [id]);
        await executeSql('UPDATE sparks SET categoryId = NULL WHERE categoryId = ?', [id]);
        await executeSql('UPDATE actions SET categoryId = NULL WHERE categoryId = ?', [id]);
        await executeSql('UPDATE paths SET categoryId = NULL WHERE categoryId = ?', [id]);
        await executeSql('UPDATE loops SET categoryId = NULL WHERE categoryId = ?', [id]);

        // Then delete the category
        await executeSql('DELETE FROM categories WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
};

// Get entries by category
export const getEntriesByCategory = async (categoryId: string): Promise<{ notes: number, sparks: number, actions: number, paths: number, loops: number }> => {
    const counts = {
        notes: 0,
        sparks: 0,
        actions: 0,
        paths: 0,
        loops: 0
    };

    try {
        // Query notes
        const notesResult = await executeSql(
            'SELECT COUNT(*) as count FROM notes WHERE categoryId = ?',
            [categoryId]
        );
        if (notesResult && notesResult.rows && notesResult.rows._array && notesResult.rows._array.length > 0) {
            counts.notes = notesResult.rows._array[0].count;
        }

        // Query sparks
        const sparksResult = await executeSql(
            'SELECT COUNT(*) as count FROM sparks WHERE categoryId = ?',
            [categoryId]
        );
        if (sparksResult && sparksResult.rows && sparksResult.rows._array && sparksResult.rows._array.length > 0) {
            counts.sparks = sparksResult.rows._array[0].count;
        }

        // Query actions
        const actionsResult = await executeSql(
            'SELECT COUNT(*) as count FROM actions WHERE categoryId = ?',
            [categoryId]
        );
        if (actionsResult && actionsResult.rows && actionsResult.rows._array && actionsResult.rows._array.length > 0) {
            counts.actions = actionsResult.rows._array[0].count;
        }

        // Query paths
        const pathsResult = await executeSql(
            'SELECT COUNT(*) as count FROM paths WHERE categoryId = ?',
            [categoryId]
        );
        if (pathsResult && pathsResult.rows && pathsResult.rows._array && pathsResult.rows._array.length > 0) {
            counts.paths = pathsResult.rows._array[0].count;
        }

        // Query loops
        const loopsResult = await executeSql(
            'SELECT COUNT(*) as count FROM loops WHERE categoryId = ?',
            [categoryId]
        );
        if (loopsResult && loopsResult.rows && loopsResult.rows._array && loopsResult.rows._array.length > 0) {
            counts.loops = loopsResult.rows._array[0].count;
        }

        return counts;
    } catch (error) {
        console.error('Error getting entries by category:', error);
        return counts;
    }
};