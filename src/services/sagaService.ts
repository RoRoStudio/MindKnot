// ----------------------------
// src/services/sagaService.ts
// ----------------------------
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Saga } from '../types/saga';
import { Chapter } from '../types/chapter';

export const createSaga = async (name: string, icon: string): Promise<Saga> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    console.log(`Creating saga with ID: ${id}`);

    await executeSql(
        'INSERT INTO sagas (id, name, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, name, icon, now, now]
    );

    const chapterId = await generateUUID();
    console.log(`Creating chapter with ID: ${chapterId}`);

    await executeSql(
        'INSERT INTO chapters (id, sagaId, chapterNumber, startDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [chapterId, id, 1, now, now, now]
    );

    return { id, name, icon, createdAt: now, updatedAt: now };
};

export const getAllSagas = async (): Promise<Saga[]> => {
    const result = await executeSql('SELECT * FROM sagas ORDER BY createdAt DESC');

    // Check if result has rows property and it's an array
    if (result && Array.isArray(result.rows)) {
        return result.rows as Saga[];
    }

    // If the structure is different, attempt to extract data
    if (result && result.rows && result.rows._array) {
        return result.rows._array as Saga[];
    }

    // Fallback to empty array if no results
    return [];
};

export const getActiveChapterForSaga = async (sagaId: string): Promise<Chapter | null> => {
    const result = await executeSql(
        'SELECT * FROM chapters WHERE sagaId = ? ORDER BY chapterNumber DESC LIMIT 1',
        [sagaId]
    );

    // Check if result has rows property and it's an array
    if (result && Array.isArray(result.rows) && result.rows.length > 0) {
        return result.rows[0] as Chapter;
    }

    // If the structure is different, attempt to extract data
    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        return result.rows._array[0] as Chapter;
    }

    return null;
};