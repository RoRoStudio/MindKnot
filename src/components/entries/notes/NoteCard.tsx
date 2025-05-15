// src/components/entries/NoteCard.tsx
import React from 'react';
import { Note } from '../../types/note';
import { EntryCard } from './EntryCard';
import { useTheme } from '../../contexts/ThemeContext';

interface NoteCardProps {
    note: Note;
    onPress?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
    const { theme } = useTheme();

    return (
        <EntryCard
            id={note.id}
            title={note.title}
            description={note.body}
            iconName="file-text"
            iconColor={theme.colors.primary}
            createdAt={note.createdAt}
            tags={note.tags}
            onPress={onPress}
        />
    );
};