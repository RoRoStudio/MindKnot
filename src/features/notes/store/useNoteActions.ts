import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { Note } from '../../../shared/types/note';
import { getAllNotes as fetchNotes, createNote, updateNote, deleteNote } from '../hooks/useNoteService';

export const useNoteActions = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const notesData = await fetchNotes();
            setNotes(notesData);
        } catch (err) {
            console.error('Error loading notes:', err);
            setError('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const addNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newNoteId = await createNote(data);
            await loadNotes(); // Reload to get the new note
            return newNoteId;
        } catch (err) {
            console.error('Error creating note:', err);
            setError('Failed to create note');
            return null;
        } finally {
            setLoading(false);
        }
    }, [loadNotes]);

    const editNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateNote(id, updates);
            if (success) {
                await loadNotes();
            }
            return success;
        } catch (err) {
            console.error('Error updating note:', err);
            setError('Failed to update note');
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadNotes]);

    const removeNote = useCallback(async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteNote(id);
            if (success) {
                setNotes(prev => prev.filter(note => note.id !== id));
            }
            return success;
        } catch (err) {
            console.error('Error deleting note:', err);
            setError('Failed to delete note');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNoteById = useCallback((id: string) => {
        const notesArray = Array.isArray(notes) ? notes : [];
        return notesArray.find((note: Note) => note.id === id) || null;
    }, [notes]);

    return {
        notes,
        loading,
        error,
        loadNotes,
        addNote,
        editNote,
        removeNote,
        getNoteById
    };
}; 