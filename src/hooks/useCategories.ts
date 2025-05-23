// src/hooks/useCategories.ts
import { useState, useCallback, useEffect } from 'react';
import { Category } from '../types/category';
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
} from '../api/categoryService';
import { executeQuery, executeWrite, getDatabase } from '../api/database';

// Global state to track category updates
let globalCategoryVersion = 0;
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
    globalCategoryVersion++;
    subscribers.forEach(callback => callback());
};

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('useCategories: loadCategories called');
            const allCategories = await getAllCategories();
            console.log('useCategories: getAllCategories returned', allCategories.length, 'categories');
            setCategories(allCategories);
            return allCategories;
        } catch (err) {
            console.error('Error loading categories:', err);
            setError(err instanceof Error ? err : new Error('Failed to load categories'));
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Subscribe to global category updates
    useEffect(() => {
        const handleUpdate = () => {
            setVersion(globalCategoryVersion);
            loadCategories();
        };

        subscribers.add(handleUpdate);

        return () => {
            subscribers.delete(handleUpdate);
        };
    }, [loadCategories]);

    // Load categories on first render
    useEffect(() => {
        loadCategories();
    }, []);

    const addCategory = useCallback(async (title: string, color: string): Promise<Category | null> => {
        try {
            setLoading(true);
            console.log('useCategories: addCategory called with', { title, color });
            const newCategory = await createCategory(title, color);
            console.log('useCategories: createCategory returned', newCategory);
            await loadCategories(); // Refresh the categories list
            notifySubscribers(); // Notify other instances
            return newCategory;
        } catch (err) {
            console.error('Error adding category:', err);
            setError(err instanceof Error ? err : new Error('Failed to add category'));
            return null;
        } finally {
            setLoading(false);
        }
    }, [loadCategories]);

    const editCategory = useCallback(async (id: string, title: string, color: string): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await updateCategory(id, title, color);
            if (success) {
                await loadCategories(); // Refresh the categories list
                notifySubscribers(); // Notify other instances
            }
            return success;
        } catch (err) {
            console.error('Error updating category:', err);
            setError(err instanceof Error ? err : new Error('Failed to update category'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadCategories]);

    const removeCategory = useCallback(async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await deleteCategory(id);
            if (success) {
                await loadCategories(); // Refresh the categories list
                notifySubscribers(); // Notify other instances
            }
            return success;
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err instanceof Error ? err : new Error('Failed to delete category'));
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadCategories]);

    const getCategory = useCallback(async (id: string): Promise<Category | null> => {
        try {
            setLoading(true);
            return await getCategoryById(id);
        } catch (err) {
            console.error('Error fetching category:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch category'));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCategories = useCallback(() => {
        loadCategories();
    }, [loadCategories]);

    return {
        categories,
        loading,
        error,
        loadCategories,
        addCategory,
        editCategory,
        removeCategory,
        getCategory,
        refreshCategories
    };
}

// Export a function to trigger global category refresh
export const refreshAllCategoryInstances = () => {
    notifySubscribers();
};