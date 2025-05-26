// src/hooks/useNotes.ts
import { useEffect } from 'react';
import { useNoteActions } from '../store/useNoteActions';

export function useNotes() {
    const {
        notes,
        loading,
        error,
        loadNotes,
        addNote,
        editNote: updateNote,
        removeNote: deleteNote,
        getNoteById
    } = useNoteActions();

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    return {
        notes,
        loading,
        error,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        getNoteById
    };
}