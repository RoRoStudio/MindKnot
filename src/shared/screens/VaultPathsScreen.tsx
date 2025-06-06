// src/screens/vault/VaultPathsScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { usePaths } from '../../features/paths/hooks/usePaths';
import { PathCard } from '../../features/paths/components/PathCard';
import { Path } from '../types/path';
import { FilterableList, Category } from '../components';
import { useCategories } from '../hooks/useCategories';
import { useBottomSheet } from '../../app/contexts/BottomSheetContext';

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

    // Format categories for filter menu
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle path press to navigate to detail screen
    const handlePathPress = useCallback((path: Path) => {
        navigation.navigate('PathScreen', {
            mode: 'view',
            id: path.id
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

    // Function to filter paths
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
            const titleMatch = path.title?.toLowerCase().includes(searchLower) || false;
            const descMatch = path.description?.toLowerCase().includes(searchLower) || false;
            return titleMatch || descMatch;
        }

        // If we got here, there's no search term or the search matches
        return true;
    }, []);

    // Function to sort paths
    const sortPaths = useCallback((a: Path, b: Path, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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

    // Render path item
    const renderItem = useCallback(({ item }: { item: Path }) => (
        <PathCard
            path={item}
            onPress={() => handlePathPress(item)}
        />
    ), [handlePathPress]);

    // Wrap loadPaths with a function that returns Promise<void>
    const loadPathsWrapper = async () => {
        await loadPaths();
        return Promise.resolve();
    };

    return (
        <>
            <FilterableList
                data={paths}
                loadData={loadPathsWrapper}
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
                categories={formattedCategories}
            />
        </>
    );
}