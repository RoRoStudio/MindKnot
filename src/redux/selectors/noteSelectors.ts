import { RootState } from '../store';

export const selectNotes = (state: RootState) => state.note.notes;
export const selectNoteLoading = (state: RootState) => state.note.loading;
export const selectNoteError = (state: RootState) => state.note.error;

// Helper selector to get a specific note by id
export const selectNoteById = (id: string) => (state: RootState) =>
    state.note.notes.find(note => note.id === id); 