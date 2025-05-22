import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import {
    fetchNotes,
    addNote,
    updateNoteThunk,
    removeNote
} from '../slices/noteSlice';
import {
    selectNotes,
    selectNoteLoading,
    selectNoteError,
    selectNoteById
} from '../selectors/noteSelectors';
import { Note } from '../../types/note';

export const useNoteActions = () => {
    const dispatch = useAppDispatch();
    const notes = useAppSelector(selectNotes);
    const loading = useAppSelector(selectNoteLoading);
    const error = useAppSelector(selectNoteError);

    // Load all notes
    const loadNotes = useCallback(async () => {
        const resultAction = await dispatch(fetchNotes());
        if (fetchNotes.fulfilled.match(resultAction)) {
            return resultAction.payload;
        }
        return [];
    }, [dispatch]);

    // Add a new note
    const addNewNote = useCallback(async (note: Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        const resultAction = await dispatch(addNote(note));
        return addNote.fulfilled.match(resultAction);
    }, [dispatch]);

    // Update an existing note
    const updateExistingNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        const resultAction = await dispatch(updateNoteThunk({ id, updates }));
        return updateNoteThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    // Delete a note
    const deleteNote = useCallback(async (id: string) => {
        const resultAction = await dispatch(removeNote(id));
        return removeNote.fulfilled.match(resultAction);
    }, [dispatch]);

    // Get a specific note by ID
    const getNoteById = useCallback((id: string) => {
        return notes.find(note => note.id === id) || null;
    }, [notes]);

    return {
        notes,
        loading,
        error,
        loadNotes,
        addNote: addNewNote,
        updateNote: updateExistingNote,
        deleteNote,
        getNoteById
    };
}; 