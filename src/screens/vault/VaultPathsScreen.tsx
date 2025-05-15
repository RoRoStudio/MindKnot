// src/screens/vault/VaultPathsScreen.tsx
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { BaseVaultScreen } from './BaseVaultScreen';
import { usePaths } from '../../hooks/usePaths';
import { PathCard } from '../../components/entries';
import { Path } from '../../types/path';

export default function VaultPathsScreen() {
    const { paths, loadPaths } = usePaths();

    // Extract all unique tags from paths
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        paths.forEach(path => path.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [paths]);

    // Function to filter paths based on search term, tags, and category
    const filterPaths = (path: Path, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
    };

    // Function to sort paths
    const sortPaths = (a: Path, b: Path, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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
            data={paths}
            loadData={async () => { await loadPaths(); }}
            renderItem={({ item }) => <PathCard path={item} />}
            allTags={allTags}
            type="paths"
            emptyIcon="compass"
            keyExtractor={(item) => item.id}
            filterPredicate={filterPaths}
            sortItems={sortPaths}
        />
    );
}