// src/services/noteService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Note } from '../types/note';

export const createNote = async (note: Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO notes (
            id, title, tags, body, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            id,
            note.title,
            note.tags ? JSON.stringify(note.tags) : null,
            note.body,
            now,
            now,
        ]
    );

    return {
        id,
        type: 'note',
        title: note.title,
        tags: note.tags || [],
        body: note.body,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllNotes = async (): Promise<Note[]> => {
    const result = await executeSql(
        'SELECT * FROM notes ORDER BY createdAt DESC',
        []
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            type: 'note'
        })) as Note[];
    }

    return [];
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const result = await executeSql(
        'SELECT * FROM notes WHERE id = ?',
        [id]
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        const row = result.rows._array[0];
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            type: 'note'
        } as Note;
    }

    return null;
};

export const updateNote = async (id: string, updates: Partial<Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    const now = new Date().toISOString();
    const current = await getNoteById(id);

    if (!current) return false;

    const updatedNote = {
        ...current,
        ...updates,
        updatedAt: now
    };

    try {
        await executeSql(
            `UPDATE notes SET 
                title = ?, 
                body = ?, 
                tags = ?,
                updatedAt = ?
             WHERE id = ?`,
            [
                updatedNote.title,
                updatedNote.body,
                updatedNote.tags ? JSON.stringify(updatedNote.tags) : null,
                now,
                id
            ]
        );
        return true;
    } catch (error) {
        console.error('Error updating note:', error);
        return false;
    }
};

export const deleteNote = async (id: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM notes WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        return false;
    }
};