// src/hooks/useNotes.ts
import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types/note';
import { createNote, getAllNotes, updateNote, deleteNote } from '../services/noteService';

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNotes = useCallback(async () => {
        try {
            console.log('Loading notes...');
            setLoading(true);
            setError(null);
            const allNotes = await getAllNotes();
            console.log(`Loaded ${allNotes.length} notes`, allNotes);
            setNotes(allNotes);
            return allNotes; // Return notes for promise chaining
        } catch (err) {
            console.error('Failed to load notes:', err);
            setError('Failed to load notes');
            throw err; // Rethrow for proper error handling
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const addNote = async (note: Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
        try {
            setLoading(true);
            setError(null);
            const newNote = await createNote(note);

            // Update the state with the new note
            setNotes(prev => [newNote, ...prev]);

            return true;
        } catch (err) {
            console.error('Failed to create note:', err);
            setError('Failed to create note');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const editNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>>) => {
        try {
            setLoading(true);
            setError(null);
            const success = await updateNote(id, updates);

            if (success) {
                // Update the local state
                setNotes(prev => prev.map(note =>
                    note.id === id ? { ...note, ...updates } : note
                ));
            }

            return success;
        } catch (err) {
            console.error('Failed to update note:', err);
            setError('Failed to update note');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeNote = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const success = await deleteNote(id);

            if (success) {
                // Remove the note from the local state
                setNotes(prev => prev.filter(note => note.id !== id));
            }

            return success;
        } catch (err) {
            console.error('Failed to delete note:', err);
            setError('Failed to delete note');
            return false;
        } finally {
            setLoading(false);
        }
    };

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