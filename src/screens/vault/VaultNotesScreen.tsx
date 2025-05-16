// src/screens/vault/VaultNotesScreen.tsx
import React, { useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaseVaultScreen } from './BaseVaultScreen';
import { useNotes } from '../../hooks/useNotes';
import { NoteCard } from '../../components/entries';
import { Note } from '../../types/note';
import { RootStackParamList } from '../../types/navigation-types';

type VaultNotesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VaultNotesScreen() {
    const navigation = useNavigation<VaultNotesScreenNavigationProp>();
    const { notes, loadNotes } = useNotes();

    // Extract all unique tags from notes
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [notes]);

    // Handle note press to navigate to detail screen
    const handleNotePress = useCallback((note: Note) => {
        navigation.navigate('NoteScreen', {
            mode: 'view',
            id: note.id
        });
    }, [navigation]);

    // Function to filter notes based on search term, tags, and category
    const filterNotes = (note: Note, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
                (note.title?.toLowerCase().includes(searchLower) ||
                    note.body?.toLowerCase().includes(searchLower)) ? true : false
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

    // Memoize the renderItem to avoid constant recreation
    const renderItem = useMemo(() => {
        return ({ item }: { item: Note }) => (
            <NoteCard
                note={item}
                onPress={() => handleNotePress(item)}
            />
        );
    }, [handleNotePress]);

    // Memoize the loadData function to avoid recreation
    const loadData = useCallback(async () => {
        await loadNotes();
    }, [loadNotes]);

    return (
        <BaseVaultScreen
            data={notes}
            loadData={loadData}
            renderItem={renderItem}
            allTags={allTags}
            type="notes"
            emptyIcon="file-text"
            keyExtractor={(item) => item.id}
            filterPredicate={filterNotes}
            sortItems={sortNotes}
        />
    );
}