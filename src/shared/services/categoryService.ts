// src/api/categoryService.ts
import { Category } from '../types/category';
import { executeQuery, executeWrite } from './database';
import { generateUUID } from '../utils/uuid';

// Debug logging helper
const logDebug = (message: string, data?: any) => {
    console.log(`[CATEGORY_SERVICE] ${message}`, data ? JSON.stringify(data) : '');
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
    logDebug('Getting all categories');
    try {
        const rows = await executeQuery<Category>('SELECT * FROM categories ORDER BY createdAt DESC');
        logDebug('Got categories', { count: rows.length });
        return rows;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Get a specific category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
    logDebug('Getting category by ID', { id });
    try {
        const rows = await executeQuery<Category>('SELECT * FROM categories WHERE id = ?', [id]);
        if (rows.length === 0) {
            logDebug('Category not found');
            return null;
        }
        const category = rows[0];
        logDebug('Category found', category);
        return category;
    } catch (error) {
        console.error(`Error fetching category with id ${id}:`, error);
        return null;
    }
};

// Create a new category
export const createCategory = async (title: string, color: string): Promise<Category> => {
    logDebug('Creating category', { title, color });
    try {
        if (!title || !title.trim()) {
            const error = new Error('Category title cannot be empty');
            logDebug('Creation failed - empty title', { error: error.toString() });
            throw error;
        }

        if (!color) {
            const error = new Error('Category color cannot be empty');
            logDebug('Creation failed - empty color', { error: error.toString() });
            throw error;
        }

        console.log('Generating UUID for category');
        const id = generateUUID();
        const now = new Date().toISOString();
        logDebug('Generated ID and timestamps', { id, now });

        console.log('Inserting category into database', { id, title, color, now });
        const result = await executeWrite(
            'INSERT INTO categories (id, title, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
            [id, title, color, now, now]
        );

        logDebug('SQL execution result', {
            rowsAffected: result.changes,
            insertId: result.changes > 0 ? 'success' : 'failure'
        });

        console.log('Category insertion result:', result);

        if (result.changes <= 0) {
            const error = new Error('Failed to insert category into database - no rows affected');
            console.error(error);
            throw error;
        }

        const newCategory = {
            id,
            title,
            color,
            createdAt: now,
            updatedAt: now,
        };

        console.log('New category created, returning:', newCategory);
        logDebug('Created category', newCategory);
        return newCategory;
    } catch (error) {
        console.error('Error creating category:', error);
        logDebug('Creation failed with error', { error: error?.toString?.() });

        // Wait a moment before rejecting to ensure logs are flushed
        await new Promise(resolve => setTimeout(resolve, 100));

        throw error;
    }
};

// Update an existing category
export const updateCategory = async (
    id: string,
    title: string,
    color: string
): Promise<boolean> => {
    logDebug('Updating category', { id, title, color });
    try {
        const now = new Date().toISOString();
        const result = await executeWrite(
            'UPDATE categories SET title = ?, color = ?, updatedAt = ? WHERE id = ?',
            [title, color, now, id]
        );
        logDebug('Update result', { rowsAffected: result.changes });
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating category:', error);
        logDebug('Update failed with error', { error: error?.toString?.() });
        return false;
    }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<boolean> => {
    logDebug('Deleting category', { id });
    try {
        const result = await executeWrite('DELETE FROM categories WHERE id = ?', [id]);
        logDebug('Deletion result', { rowsAffected: result.changes });
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting category:', error);
        logDebug('Deletion failed with error', { error: error?.toString?.() });
        return false;
    }
};

// Check if a category is being used across all entry types
export const checkCategoryUsage = async (categoryId: string): Promise<{
    isUsed: boolean;
    usage: {
        notes: number;
        sparks: number;
        actions: number;
        loops: number;
        paths: number;
    };
    totalUsage: number;
}> => {
    logDebug('Checking category usage', { categoryId });
    try {
        const usage = {
            notes: 0,
            sparks: 0,
            actions: 0,
            loops: 0,
            paths: 0,
        };

        // Check notes
        const notesResult = await executeQuery(
            'SELECT COUNT(*) as count FROM notes WHERE categoryId = ?',
            [categoryId]
        );
        usage.notes = notesResult[0]?.count || 0;

        // Check sparks
        const sparksResult = await executeQuery(
            'SELECT COUNT(*) as count FROM sparks WHERE categoryId = ?',
            [categoryId]
        );
        usage.sparks = sparksResult[0]?.count || 0;

        // Check actions
        const actionsResult = await executeQuery(
            'SELECT COUNT(*) as count FROM actions WHERE categoryId = ?',
            [categoryId]
        );
        usage.actions = actionsResult[0]?.count || 0;

        // Check loops
        const loopsResult = await executeQuery(
            'SELECT COUNT(*) as count FROM loops WHERE categoryId = ?',
            [categoryId]
        );
        usage.loops = loopsResult[0]?.count || 0;

        // Check paths
        const pathsResult = await executeQuery(
            'SELECT COUNT(*) as count FROM paths WHERE categoryId = ?',
            [categoryId]
        );
        usage.paths = pathsResult[0]?.count || 0;

        const totalUsage = usage.notes + usage.sparks + usage.actions + usage.loops + usage.paths;
        const isUsed = totalUsage > 0;

        logDebug('Category usage check complete', { usage, totalUsage, isUsed });
        return { isUsed, usage, totalUsage };
    } catch (error) {
        console.error('Error checking category usage:', error);
        logDebug('Usage check failed with error', { error: error?.toString?.() });
        return {
            isUsed: false,
            usage: { notes: 0, sparks: 0, actions: 0, loops: 0, paths: 0 },
            totalUsage: 0
        };
    }
};

// Get entries by category
export const getEntriesByCategory = async (
    categoryId: string,
    entryType: 'notes' | 'sparks' | 'actions' | 'loops' | 'paths'
): Promise<any[]> => {
    logDebug('Getting entries by category', { categoryId });
    try {
        const entries = await executeQuery(
            `SELECT * FROM ${entryType} WHERE categoryId = ? ORDER BY updatedAt DESC`,
            [categoryId]
        );
        logDebug('Got entries', { count: entries.length });
        return entries;
    } catch (error) {
        console.error(`Error fetching ${entryType} for category ${categoryId}:`, error);
        logDebug('Get entries failed with error', { error: error?.toString?.() });
        throw error;
    }
};

// Cleanup test categories (enhanced to catch more patterns)
export const cleanupTestCategories = async (): Promise<{
    deleted: number;
    errors: string[];
}> => {
    logDebug('Starting comprehensive test category cleanup');
    try {
        const errors: string[] = [];
        let totalDeleted = 0;

        // Get all categories that look like test data
        const testCategories = await executeQuery(`
            SELECT id, title FROM categories 
            WHERE title LIKE '%test%' 
            OR title LIKE '%Test%' 
            OR title LIKE '%TEST%'
            OR title = 'Direct Test'
            OR title = 'Test Category'
            OR id = 'test-id'
            OR id LIKE 'direct-test-%'
            OR id LIKE '%test%'
        `);

        logDebug('Found potential test categories', { count: testCategories.length });

        for (const category of testCategories) {
            try {
                // Check if category is in use
                const usage = await checkCategoryUsage(category.id);

                if (usage.isUsed) {
                    const message = `Skipped '${category.title}' - in use (${usage.totalUsage} entries)`;
                    console.log(message);
                    errors.push(message);
                    continue;
                }

                // Delete the category
                const deleted = await deleteCategory(category.id);
                if (deleted) {
                    totalDeleted++;
                    console.log(`Deleted test category: '${category.title}' (${category.id})`);
                } else {
                    const message = `Failed to delete '${category.title}'`;
                    console.error(message);
                    errors.push(message);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const message = `Error processing '${category.title}': ${errorMessage}`;
                console.error(message);
                errors.push(message);
            }
        }

        console.log(`Cleanup complete: ${totalDeleted} categories deleted, ${errors.length} errors`);
        return { deleted: totalDeleted, errors };
    } catch (error) {
        console.error('Error during test category cleanup:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { deleted: 0, errors: [errorMessage] };
    }
};