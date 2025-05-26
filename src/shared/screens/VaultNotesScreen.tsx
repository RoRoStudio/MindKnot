// src/screens/vault/VaultNotesScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNotes } from '../../features/notes/hooks/useNotes';
import { NoteCard } from '../../features/notes/components/NoteCard';
import { Note } from '../types/note';
import { RootStackParamList } from '../types/navigation';
import { FilterableList, Category } from '../components';
import { useCategories } from '../hooks/useCategories';
import { useBottomSheet } from '../../app/contexts/BottomSheetContext';

type VaultNotesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VaultNotesScreen() {
    const navigation = useNavigation<VaultNotesScreenNavigationProp>();
    const { notes, loadNotes } = useNotes();
    const { categories } = useCategories();
    const { showNoteForm } = useBottomSheet();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
    const [isGridView, setIsGridView] = useState(true);

    // Extract all unique tags from notes
    const allTags = useMemo(() => {
        const tagSet = new Set<string>();
        const notesArray = Array.isArray(notes) ? notes : [];
        notesArray.forEach((note: Note) => note.tags?.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }, [notes]);

    // Format categories for the FilterableListHeader
    const formattedCategories = useMemo(() => {
        return categories.map(cat => ({
            id: cat.id,
            title: cat.title,
            color: cat.color
        }));
    }, [categories]);

    // Handle note press to navigate to detail screen
    const handleNotePress = useCallback((note: Note) => {
        navigation.navigate('NoteScreen', {
            mode: 'view',
            id: note.id
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

    // Function to filter notes based on search term, tags, and category
    const filterNotes = useCallback((note: Note, searchTerm: string, selectedTags: string[], categoryId: string | null): boolean => {
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
    }, []);

    // Function to sort notes
    const sortNotes = useCallback((a: Note, b: Note, sortOrder: 'newest' | 'oldest' | 'alphabetical') => {
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

    // Memoize the renderItem to avoid constant recreation
    const renderItem = useMemo(() => {
        return ({ item }: { item: Note }) => (
            <NoteCard
                note={item}
                onPress={() => handleNotePress(item)}
                onEntryUpdated={loadNotes}
            />
        );
    }, [handleNotePress, loadNotes]);

    // Wrap loadNotes with a function that returns Promise<void>
    const loadNotesWrapper = async () => {
        await loadNotes();
        return Promise.resolve();
    };

    return (
        <>
            <FilterableList
                data={Array.isArray(notes) ? notes : []}
                loadData={loadNotesWrapper}
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
                emptyIcon="file-text"
                emptyText="No notes found. Create your first note!"
                keyExtractor={(item) => item.id}
                filterPredicate={filterNotes}
                sortItems={sortNotes}
                isGridView={isGridView}
                onToggleView={handleToggleView}
                onCreateItem={showNoteForm}
                createButtonLabel="Create Note"
                categories={formattedCategories}
            />
        </>
    );
}