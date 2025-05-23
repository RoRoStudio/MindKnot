// src/api/sagaService.ts
import { executeSql } from './database';
import { generateUUID } from '../utils/uuidUtil';
import { Saga } from '../types/saga';
import { Chapter } from '../types/chapter';
import { IconName } from '../components/common';

export const createSaga = async (name: string, icon: IconName): Promise<Saga | null> => {
    try {
        const id = Math.random().toString(36).substring(2, 15);
        const now = new Date().toISOString();

        const saga: Saga = {
            id,
            name,
            icon,
            createdAt: now,
            updatedAt: now
        };

        await executeSql(
            'INSERT INTO sagas (id, name, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
            [saga.id, saga.name, saga.icon, saga.createdAt, saga.updatedAt]
        );

        const chapterId = await generateUUID();
        console.log(`Creating chapter with ID: ${chapterId}`);

        await executeSql(
            'INSERT INTO chapters (id, sagaId, chapterNumber, startDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [chapterId, id, 1, now, now, now]
        );

        return saga;
    } catch (error) {
        console.error('Error creating saga:', error);
        return null;
    }
};

export const getAllSagas = async (): Promise<Saga[]> => {
    try {
        const result = await executeSql('SELECT * FROM sagas ORDER BY createdAt DESC');
        return result.rows._array;
    } catch (error) {
        console.error('Error getting sagas:', error);
        return [];
    }
};

export const getActiveChapterForSaga = async (sagaId: string): Promise<Chapter | null> => {
    const result = await executeSql(
        'SELECT * FROM chapters WHERE sagaId = ? ORDER BY chapterNumber DESC LIMIT 1',
        [sagaId]
    );

    // Check if result has rows property and it's an array with data
    if (result && result.rows && Array.isArray(result.rows) && result.rows.length > 0) {
        return result.rows[0] as Chapter;
    }

    return null;
};

export const getSagaById = async (id: string): Promise<Saga | null> => {
    try {
        const result = await executeSql('SELECT * FROM sagas WHERE id = ?', [id]);
        if (result.rows && result.rows._array && result.rows._array.length > 0) {
            return result.rows._array[0];
        }
        return null;
    } catch (error) {
        console.error(`Error getting saga by id ${id}:`, error);
        return null;
    }
};

export const deleteSaga = async (id: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM sagas WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error(`Error deleting saga ${id}:`, error);
        return false;
    }
};