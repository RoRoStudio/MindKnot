// src/components/entries/notes/NoteCard.tsx
import React, { useCallback, memo } from 'react';
import { Note } from '../../../types/note';
import { EntryCard } from '../EntryCard';
import { ENTRY_TYPES, EntryType } from '../../../constants/entryTypes';

interface NoteCardProps {
    note: Note;
    onPress?: () => void;
    onEntryUpdated?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = memo(({
    note,
    onPress,
    onEntryUpdated
}) => {
    return (
        <EntryCard
            id={note.id}
            title={note.title}
            description={note.body}
            iconName={ENTRY_TYPES[EntryType.NOTE].icon}
            borderColor={ENTRY_TYPES[EntryType.NOTE].borderColor}
            createdAt={note.createdAt}
            tags={note.tags}
            categoryId={note.categoryId}
            onPress={onPress}
            isStarred={note.isStarred}
            entryType="note"
            onEntryUpdated={onEntryUpdated}
            // Notes don't need to be expandable
            expandable={false}
            navigationScreen="NoteScreen"
        />
    );
});