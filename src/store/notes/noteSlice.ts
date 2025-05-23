import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Note } from '../../types/note';
import { getAllNotes, createNote, updateNote, deleteNote } from '../../api/noteService';

interface NoteState {
    notes: Note[];
    loading: boolean;
    error: string | null;
}

const initialState: NoteState = {
    notes: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchNotes = createAsyncThunk(
    'notes/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await getAllNotes();
        } catch (error) {
            console.error('Failed to load notes:', error);
            return rejectWithValue('Failed to load notes');
        }
    }
);

export const addNote = createAsyncThunk(
    'notes/add',
    async (note: Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
        try {
            return await createNote(note);
        } catch (error) {
            console.error('Failed to create note:', error);
            return rejectWithValue('Failed to create note');
        }
    }
);

export const updateNoteThunk = createAsyncThunk(
    'notes/update',
    async ({ id, updates }: { id: string; updates: Partial<Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
        try {
            const success = await updateNote(id, updates);
            if (success) {
                return { id, updates };
            }
            return rejectWithValue('Failed to update note');
        } catch (error) {
            console.error('Failed to update note:', error);
            return rejectWithValue('Failed to update note');
        }
    }
);

export const removeNote = createAsyncThunk(
    'notes/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            const success = await deleteNote(id);
            if (success) {
                return id;
            }
            return rejectWithValue('Failed to delete note');
        } catch (error) {
            console.error('Failed to delete note:', error);
            return rejectWithValue('Failed to delete note');
        }
    }
);

const noteSlice = createSlice({
    name: 'note',
    initialState,
    reducers: {
        setNotes: (state, action: PayloadAction<Note[]>) => {
            state.notes = action.payload;
        },
        clearNotes: (state) => {
            state.notes = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all notes
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.notes = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add note
            .addCase(addNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNote.fulfilled, (state, action) => {
                state.notes.unshift(action.payload as Note);
                state.loading = false;
            })
            .addCase(addNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update note
            .addCase(updateNoteThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNoteThunk.fulfilled, (state, action) => {
                const { id, updates } = action.payload as { id: string; updates: Partial<Note> };
                state.notes = state.notes.map(note =>
                    note.id === id ? { ...note, ...updates } : note
                );
                state.loading = false;
            })
            .addCase(updateNoteThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Remove note
            .addCase(removeNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeNote.fulfilled, (state, action) => {
                state.notes = state.notes.filter(note => note.id !== action.payload);
                state.loading = false;
            })
            .addCase(removeNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setNotes, clearNotes } = noteSlice.actions;

export default noteSlice.reducer; 