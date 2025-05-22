// src/screens/vault/VaultSparksScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSparks } from '../../hooks/useSparks';
import { SparkCard } from '../../components/entries';
import { Spark } from '../../types/spark';
import { RootStackParamList } from '../../types/navigation-types';
import { FilterableList, Category } from '../../components/common';
import { useCategories } from '../../hooks/useCategories';
import { useBottomSheet } from '../../contexts/BottomSheetContext';

type VaultSparksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VaultSparksScreen() {
    const navigation = useNavigation<VaultSparksScreenNavigationProp>();
    const { sparks, loadSparks } = useSparks();
    const { categories } = useCategories();
    const { showSparkForm } = useBottomSheet();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(true);

    // Extract all unique tags from sparks
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        sparks.forEach(spark => spark.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [sparks]);

    // Format categories for filter menu
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle spark press to navigate to detail screen
    const handleSparkPress = useCallback((spark: Spark) => {
        navigation.navigate('SparkScreen', {
            mode: 'view',
            id: spark.id
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

    // Function to filter sparks
    const filterSparks = useCallback((spark: Spark, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
        // Filter by category
        if (categoryId && spark.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => spark.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const titleMatch = spark.title?.toLowerCase().includes(searchLower) || false;
            const bodyMatch = spark.body?.toLowerCase().includes(searchLower) || false;
            return titleMatch || bodyMatch;
        }

        // If we got here, there's no search term or the search matches
        return true;
    }, []);

    // Function to sort sparks
    const sortSparks = useCallback((a: Spark, b: Spark, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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

    // Render spark item
    const renderItem = useCallback(({ item }: { item: Spark }) => (
        <SparkCard
            spark={item}
            onPress={() => handleSparkPress(item)}
        />
    ), [handleSparkPress]);

    return (
        <>
            <FilterableList
                data={sparks}
                loadData={async () => { await loadSparks(); }}
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
                emptyIcon="lightbulb"
                emptyText="No sparks found. Create your first spark!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterSparks}
                sortItems={sortSparks}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={showSparkForm}
                createButtonLabel="Create Spark"
                categories={formattedCategories}
            />
        </>
    );
}