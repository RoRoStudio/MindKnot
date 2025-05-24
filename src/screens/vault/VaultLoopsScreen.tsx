// src/screens/vault/VaultLoopsScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation-types';
import { useLoops } from '../../hooks/useLoops';
import { LoopCard } from '../../components/entries';
import { Loop } from '../../types/loop';
import { FilterableList, Category } from '../../components/common';
import { useCategories } from '../../hooks/useCategories';
import { useBottomSheet } from '../../contexts/BottomSheetContext';

export default function VaultLoopsScreen() {
    const { loops, loadLoops } = useLoops();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { categories } = useCategories();
    const { showLoopForm } = useBottomSheet();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(false);

    // Extract all unique tags from loops
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        loops.forEach(loop => loop.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [loops]);

    // Format categories for filter menu
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle loop press to navigate to detail screen
    const handleLoopPress = useCallback((loop: Loop) => {
        navigation.navigate('LoopScreen', {
            mode: 'view',
            id: loop.id
        });
    }, [navigation]);

    // Toggle tag selection
    const handleToggleTag = useCallback((tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedTags([]);
        setCategoryId(null);
        setSortOrder('newest');
    }, []);

    // Toggle between grid and list view
    const handleToggleView = useCallback(() => {
        setIsGridView(prev => !prev);
    }, []);

    // Function to filter loops
    const filterLoops = useCallback((loop: Loop, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
        // Filter by category
        if (categoryId && loop.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => loop.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                (loop.title?.toLowerCase().includes(searchLower) ?? false) ||
                (loop.description?.toLowerCase().includes(searchLower) ?? false)
            );
        }

        return true;
    }, []);

    // Function to sort loops
    const sortLoops = useCallback((a: Loop, b: Loop, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
        switch (sortOrder) {
            case 'newest':
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest':
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'alphabetical':
                return a.title.localeCompare(b.title);
            default:
                return 0;
        }
    }, []);

    // Render loop item
    const renderItem = useCallback(({ item }: { item: Loop }) => (
        <LoopCard
            loop={item}
            onPress={() => handleLoopPress(item)}
        />
    ), [handleLoopPress]);

    // Wrap loadLoops with a function that returns Promise<void>
    const loadLoopsWrapper = async () => {
        await loadLoops();
        return Promise.resolve();
    };

    return (
        <>
            <FilterableList
                data={loops}
                loadData={loadLoopsWrapper}
                renderItem={renderItem}
                allTags={allTags}
                selectedTags={selectedTags}
                onToggleTag={handleToggleTag}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                emptyIcon="calendar-sync"
                emptyText="No loops found. Create your first loop!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterLoops}
                sortItems={sortLoops}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={showLoopForm}
                createButtonLabel="Create Loop"
                categories={formattedCategories}
            />
        </>
    );
}