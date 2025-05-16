// src/screens/vault/VaultPathsScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation-types';
import { usePaths } from '../../hooks/usePaths';
import { PathCard } from '../../components/entries';
import { Path } from '../../types/path';
import { FilterableList, FilterableListHeader } from '../../components/common';
import { useCategories } from '../../hooks/useCategories';
import { useBottomSheet } from '../../contexts/BottomSheetContext';

export default function VaultPathsScreen() {
    const { paths, loadPaths } = usePaths();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { categories } = useCategories();
    const { showPathForm } = useBottomSheet();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(false);

    // Extract all unique tags from paths
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        paths.forEach(path => path.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [paths]);

    // Format categories for the FilterableListHeader
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle path press
    const handlePathPress = useCallback((pathId: string) => {
        navigation.navigate('PathScreen', { mode: 'view', id: pathId });
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

    // Function to filter paths based on search term, tags, and category
    const filterPaths = useCallback((path: Path, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
        // Filter by category
        if (categoryId && path.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => path.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return !!(
                path.title?.toLowerCase().includes(searchLower) ||
                path.description?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    }, []);

    // Function to sort paths
    const sortPaths = useCallback((a: Path, b: Path, sortOrder: 'newest' | 'oldest' | 'alphabetical'): number => {
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

    // Render item
    const renderItem = useCallback(({ item }: { item: Path }) => (
        <PathCard
            path={item}
            onPress={() => handlePathPress(item.id)}
        />
    ), [handlePathPress]);

    return (
        <>
            <FilterableList
                data={paths}
                loadData={loadPaths}
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
                emptyIcon="compass"
                emptyText="No paths found. Create your first path!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterPaths}
                sortItems={sortPaths}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={showPathForm}
                createButtonLabel="Create Path"
                ListHeaderComponent={
                    <FilterableListHeader
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        allTags={allTags}
                        selectedTags={selectedTags}
                        onToggleTag={handleToggleTag}
                        categories={formattedCategories}
                        categoryId={categoryId}
                        onCategoryChange={setCategoryId}
                        sortOrder={sortOrder}
                        onSortChange={setSortOrder}
                        onClearFilters={handleClearFilters}
                    />
                }
            />
        </>
    );
}