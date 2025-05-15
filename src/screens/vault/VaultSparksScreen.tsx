// src/screens/vault/VaultSparksScreen.tsx
import React, { useMemo } from 'react';
import { View, Dimensions, FlatList } from 'react-native';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useSparks } from '../../hooks/useSparks';
import { SparkCard } from '../../components/entries';
import { Spark } from '../../types/spark';
import { useStyles } from '../../hooks/useStyles';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import { useVaultFilters } from '../../contexts/VaultFiltersContext';
import { VaultSearchHeader } from './VaultSearchHeader';
import { VaultEmptyState } from './VaultEmptyState';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on each side and 16px between

export default function VaultSparksScreen() {
    const { sparks, loadSparks } = useSparks();
    const { showSparkForm } = useBottomSheet();
    const { searchTerm, selectedTags, categoryId, sort } = useVaultFilters();

    // Extract all unique tags from sparks
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        sparks.forEach(spark => spark.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [sparks]);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        gridContainer: {
            padding: theme.spacing.m,
        },
        gridItem: {
            width: COLUMN_WIDTH,
            margin: theme.spacing.xs,
        },
    }));

    // Function to filter sparks based on search term, tags, and category
    const filterSparks = (spark: Spark) => {
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
            return (
                spark.title?.toLowerCase().includes(searchLower) ||
                spark.body?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Get filtered and sorted sparks
    const filteredSparks = useMemo(() => {
        let filtered = sparks.filter(filterSparks);

        return filtered.sort((a, b) => {
            switch (sort) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }, [sparks, searchTerm, selectedTags, categoryId, sort]);

    // Custom renderer for grid layout
    const renderItem = ({ item, index }: { item: Spark, index: number }) => (
        <View style={styles.gridItem}>
            <SparkCard spark={item} />
        </View>
    );

    // Check if filters are applied
    const hasFiltersApplied = searchTerm !== '' || selectedTags.length > 0 || categoryId !== null;

    return (
        <View style={styles.container}>
            <VaultSearchHeader allTags={allTags} />

            {filteredSparks.length === 0 ? (
                <VaultEmptyState
                    type="sparks"
                    onCreatePress={showSparkForm}
                    icon="lightbulb"
                    hasFiltersApplied={hasFiltersApplied}
                />
            ) : (
                <FlatList
                    data={filteredSparks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                />
            )}
        </View>
    );
}