// src/hooks/useCategories.ts
import { useState, useEffect, useCallback } from 'react';
import { Category } from '../types/category';
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getEntriesByCategory
} from '../services/categoryService';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const allCategories = await getAllCategories();
            setCategories(allCategories);
            return allCategories;
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError('Failed to load categories');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const addCategory = async (title: string, color: string) => {
        try {
            setLoading(true);
            setError(null);
            const newCategory = await createCategory(title, color);
            setCategories(prev => [...prev, newCategory]);
            return newCategory;
        } catch (err) {
            console.error('Failed to create category:', err);
            setError('Failed to create category');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getCategory = async (id: string) => {
        if (!id) return null;
        try {
            return await getCategoryById(id);
        } catch (err) {
            console.error('Failed to get category:', err);
            return null;
        }
    };

    const editCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateCategory(id, updates);
            if (success) {
                // Update the state with the new category
                setCategories(prev => prev.map(category =>
                    category.id === id ? { ...category, ...updates } : category
                ));
            }
            return success;
        } catch (err) {
            console.error('Failed to update category:', err);
            setError('Failed to update category');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeCategory = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteCategory(id);
            if (success) {
                // Remove from state
                setCategories(prev => prev.filter(category => category.id !== id));
            }
            return success;
        } catch (err) {
            console.error('Failed to delete category:', err);
            setError('Failed to delete category');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCategoryEntryCount = async (categoryId: string) => {
        return await getEntriesByCategory(categoryId);
    };

    return {
        categories,
        loading,
        error,
        loadCategories,
        addCategory,
        getCategory,
        editCategory,
        removeCategory,
        getCategoryEntryCount
    };
}