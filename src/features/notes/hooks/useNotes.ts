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

    // Remove redundant useEffect - let the parent component handle when to load

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