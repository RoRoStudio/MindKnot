// src/hooks/useNotes.ts
import { useEffect } from 'react';
import { useNoteActions } from '../redux/hooks/stateHooks';

export function useNotes() {
    const {
        notes,
        loading,
        error,
        loadNotes,
        addNote,
        updateNote: editNote,
        deleteNote: removeNote,
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
        editNote,
        removeNote
    };
}