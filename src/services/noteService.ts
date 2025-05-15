// src/services/noteService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Note } from '../types/note';

// Temporary function for migration
export const migrateNotesFromCaptures = async (): Promise<void> => {
    // Fetch all captures with subType NOTE
    const result = await executeSql(
        'SELECT * FROM captures WHERE subType = ?',
        ['note']
    );

    if (!result || !result.rows || !result.rows._array) {
        console.log('No notes to migrate');
        return;
    }

    // Process each note capture and insert into the captures table with type 'note'
    for (const capture of result.rows._array) {
        await executeSql(
            `UPDATE captures SET 
                type = ?, 
                subType = NULL,
                sagaId = NULL, 
                chapterId = NULL
             WHERE id = ?`,
            ['note', capture.id]
        );
    }

    console.log(`Migrated ${result.rows._array.length} notes from captures`);
};

export const createNote = async (note: Omit<Note, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO captures (
            id, type, title, tags, body, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            'note',
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
        tags: note.tags,
        body: note.body,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllNotes = async (): Promise<Note[]> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE type = ? ORDER BY createdAt DESC',
        ['note']
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
        'SELECT * FROM captures WHERE id = ? AND type = ?',
        [id, 'note']
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
            `UPDATE captures SET 
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
        await executeSql('DELETE FROM captures WHERE id = ? AND type = ?', [id, 'note']);
        return true;
    } catch (error) {
        console.error('Error deleting note:', error);
        return false;
    }
};