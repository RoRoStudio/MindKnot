// src/screens/vault/VaultActionsScreen.tsx - Optimized version with performance improvements
import React, { useMemo } from 'react';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useActions } from '../../hooks/useActions';
import { ActionCard } from '../../components/entries';
import { Action } from '../../types/action';

export default function VaultActionsScreen() {
    const { actions, loadActions } = useActions();

    // Extract all unique tags from actions
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        actions.forEach(action => action.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [actions]);

    // Function to filter actions based on search term, tags, and category
    const filterActions = (action: Action, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
            return !!(
                action.title?.toLowerCase().includes(searchLower) ||
                action.body?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Function to sort actions
    const sortActions = (a: Action, b: Action, sortOrder: 'newest' | 'oldest' | 'alphabetical'): number => {
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
            data={actions}
            loadData={async () => { await loadActions(); }}
            renderItem={({ item }) => <ActionCard action={item} />}
            allTags={allTags}
            type="actions"
            emptyIcon="check"
            keyExtractor={(item) => item.id}
            filterPredicate={filterActions}
            sortItems={sortActions}
        />
    );
}