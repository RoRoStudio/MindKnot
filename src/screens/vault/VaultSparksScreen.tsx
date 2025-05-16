// src/screens/vault/VaultSparksScreen.tsx
import React, { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useSparks } from '../../hooks/useSparks';
import { SparkCard } from '../../components/entries';
import { Spark } from '../../types/spark';
import { RootStackParamList } from '../../types/navigation-types';

type VaultSparksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VaultSparksScreen() {
    const navigation = useNavigation<VaultSparksScreenNavigationProp>();
    const { sparks, loadSparks } = useSparks();

    // Extract all unique tags from sparks
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        sparks.forEach(spark => spark.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [sparks]);

    // Handle spark press to navigate to detail screen
    const handleSparkPress = useCallback((spark: Spark) => {
        navigation.navigate('SparkScreen', {
            mode: 'view',
            id: spark.id
        });
    }, [navigation]);

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
            return (
                (spark.title?.toLowerCase().includes(searchLower) ||
                    spark.body?.toLowerCase().includes(searchLower)) ? true : false
            );
        }

        return true;
    };

    // Function to sort sparks
    const sortSparks = (a: Spark, b: Spark, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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

    // Memoize the renderItem to avoid constant recreation
    const renderItem = useMemo(() => {
        return ({ item }: { item: Spark }) => (
            <SparkCard
                spark={item}
                onPress={() => handleSparkPress(item)}
            />
        );
    }, [handleSparkPress]);

    // Memoize the loadData function to avoid recreation
    const loadData = useCallback(async () => {
        await loadSparks();
    }, [loadSparks]);

    return (
        <BaseVaultScreen
            data={sparks}
            loadData={loadData}
            renderItem={renderItem}
            allTags={allTags}
            type="sparks"
            emptyIcon="sparkles"
            keyExtractor={(item) => item.id}
            filterPredicate={filterSparks}
            sortItems={sortSparks}
        />
    );
}