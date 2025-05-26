// src/screens/vault/VaultActionsScreen.tsx - Optimized version with performance improvements
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useActions } from '../../features/actions/hooks/useActions';
import { ActionCard } from '../../features/actions/components/ActionCard';
import { Action } from '../types/action';
import { FilterableList, Category } from '../components';
import { useCategories } from '../hooks/useCategories';
import { useBottomSheet } from '../../app/contexts/BottomSheetContext';

export default function VaultActionsScreen() {
    const { actions, loadActions } = useActions();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { categories } = useCategories();
    const { showActionForm } = useBottomSheet();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(false);

    // Extract all unique tags from actions
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        actions.forEach(action => action.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [actions]);

    // Format categories for filter menu
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle action press to navigate to detail screen
    const handleActionPress = useCallback((action: Action) => {
        navigation.navigate('ActionScreen', {
            mode: 'view',
            id: action.id
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

    // Function to filter actions
    const filterActions = useCallback((action: Action, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
        // Filter by category
        if (categoryId && action.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => action.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const titleMatch = action.title?.toLowerCase().includes(searchLower) || false;
            const bodyMatch = action.body?.toLowerCase().includes(searchLower) || false;
            return titleMatch || bodyMatch;
        }

        // If we got here, there's no search term or the search matches
        return true;
    }, []);

    // Function to sort actions
    const sortActions = useCallback((a: Action, b: Action, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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

    // Render action item
    const renderItem = useCallback(({ item }: { item: Action }) => (
        <ActionCard
            action={item}
            onPress={() => handleActionPress(item)}
        />
    ), [handleActionPress]);

    // Wrap loadActions with a function that returns Promise<void>
    const loadActionsWrapper = async () => {
        await loadActions();
        return Promise.resolve();
    };

    return (
        <>
            <FilterableList
                data={actions}
                loadData={loadActionsWrapper}
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
                emptyIcon="check"
                emptyText="No actions found. Create your first action!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterActions}
                sortItems={sortActions}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={showActionForm}
                createButtonLabel="Create Action"
                categories={formattedCategories}
            />
        </>
    );
}