// src/screens/vault/VaultSparksScreen.tsx
import React, { useMemo } from 'react';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useSparks } from '../../hooks/useSparks';
import { SparkCard } from '../../components/entries';
import { Spark } from '../../types/spark';

export default function VaultSparksScreen() {
    const { sparks, loadSparks } = useSparks();

    // Extract all unique tags from sparks
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        sparks.forEach(spark => spark.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [sparks]);

    // Function to filter sparks based on search term, tags, and category
    const filterSparks = (spark: Spark, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
            return !!(
                spark.title?.toLowerCase().includes(searchLower) ||
                spark.body?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Function to sort sparks
    const sortSparks = (a: Spark, b: Spark, sortOrder: 'newest' | 'oldest' | 'alphabetical'): number => {
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
    };

    return (
        <BaseVaultScreen
            data={sparks}
            loadData={async () => { await loadSparks(); }}
            renderItem={({ item }) => <SparkCard spark={item} />}
            allTags={allTags}
            type="sparks"
            emptyIcon="lightbulb"
            keyExtractor={(item) => item.id}
            filterPredicate={filterSparks}
            sortItems={sortSparks}
        />
    );
}