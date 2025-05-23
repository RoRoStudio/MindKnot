// src/components/entries/notes/NoteCard.tsx
import React, { useCallback, memo } from 'react';
import { Note } from '../../../types/note';
import { EntryCard } from '../EntryCard';
import { ENTRY_TYPES, EntryType } from '../../../constants/entryTypes';

interface NoteCardProps {
    note: Note;
    onPress?: () => void;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onArchive?: (id: string) => void;
    onHide?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = memo(({
    note,
    onPress,
    onStar,
    onDuplicate,
    onArchive,
    onHide
}) => {
    // Handle quick actions with useCallback to prevent unnecessary re-renders
    const handleStar = useCallback(() => {
        if (onStar) onStar(note.id);
    }, [onStar, note.id]);

    const handleDuplicate = useCallback(() => {
        if (onDuplicate) onDuplicate(note.id);
    }, [onDuplicate, note.id]);

    const handleArchive = useCallback(() => {
        if (onArchive) onArchive(note.id);
    }, [onArchive, note.id]);

    const handleHide = useCallback(() => {
        if (onHide) onHide(note.id);
    }, [onHide, note.id]);

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
            onStar={handleStar}
            onDuplicate={handleDuplicate}
            onArchive={handleArchive}
            onHide={handleHide}
            // Notes don't need to be expandable
            expandable={false}
            navigationScreen="NoteScreen"
        />
    );
});