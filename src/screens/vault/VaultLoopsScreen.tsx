// src/screens/vault/VaultLoopsScreen.tsx
import React, { useMemo } from 'react';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useLoops } from '../../hooks/useLoops';
import { LoopCard } from '../../components/entries';
import { Loop } from '../../types/loop';

export default function VaultLoopsScreen() {
    const { loops, loadLoops } = useLoops();

    // Extract all unique tags from loops
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        loops.forEach(loop => loop.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [loops]);

    // Function to filter loops based on search term, tags, and category
    const filterLoops = (loop: Loop, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
            return !!(
                loop.title?.toLowerCase().includes(searchLower) ||
                loop.description?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Function to sort loops
    const sortLoops = (a: Loop, b: Loop, sortOrder: 'newest' | 'oldest' | 'alphabetical'): number => {
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
            data={loops}
            loadData={async () => { await loadLoops(); }}
            renderItem={({ item }) => <LoopCard loop={item} />}
            allTags={allTags}
            type="loops"
            emptyIcon="calendar-sync"
            keyExtractor={(item) => item.id}
            filterPredicate={filterLoops}
            sortItems={sortLoops}
        />
    );
}