// src/screens/vault/VaultNotesScreen.tsx
import React, { useMemo } from 'react';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useNotes } from '../../hooks/useNotes';
import { NoteCard } from '../../components/entries';
import { Note } from '../../types/note';

export default function VaultNotesScreen() {
    const { notes, loadNotes } = useNotes();

    // Extract all unique tags from notes
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [notes]);

    // Function to filter notes based on search term, tags, and category
    const filterNotes = (note: Note, searchTerm: string, selectedTags: string[], categoryId: string | null) => {
        // Filter by category
        if (categoryId && note.categoryId !== categoryId) {
            return false;
        }

        // Filter by selected tags
        if (selectedTags.length > 0 && !selectedTags.every(tag => note.tags?.includes(tag))) {
            return false;
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                note.title?.toLowerCase().includes(searchLower) ||
                note.body?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    };

    // Function to sort notes
    const sortNotes = (a: Note, b: Note, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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
            data={notes}
            loadData={async () => { await loadNotes(); }}
            renderItem={({ item }) => <NoteCard note={item} />}
            allTags={allTags}
            type="notes"
            emptyIcon="file-text"
            keyExtractor={(item) => item.id}
            filterPredicate={filterNotes}
            sortItems={sortNotes}
        />
    );
}