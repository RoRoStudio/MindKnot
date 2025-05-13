// ----------------------------
// src/services/sagaService.ts
// ----------------------------
import db from '../database/database';
import { v4 as uuidv4 } from 'uuid';
import { Saga } from '../types/saga';
import { Chapter } from '../types/chapter';

export const createSaga = async (name: string, icon: string): Promise<Saga> => {
    const id = uuidv4();
    const now = new Date().toISOString();

    await new Promise<void>((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'INSERT INTO sagas (id, name, icon, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
                [id, name, icon, now, now],
                () => resolve(),
                (_: any, err: any) => reject(err)
            );
        });
    });

    const chapterId = uuidv4();
    await new Promise<void>((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'INSERT INTO chapters (id, sagaId, chapterNumber, startDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [chapterId, id, 1, now, now, now],
                () => resolve(),
                (_: any, err: any) => reject(err)
            );
        });
    });

    return { id, name, icon, createdAt: now, updatedAt: now };
};

export const getAllSagas = async (): Promise<Saga[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM sagas ORDER BY createdAt DESC',
                [],
                (_: any, result: any) => {
                    const sagas = result.rows._array as Saga[];
                    resolve(sagas);
                },
                (_: any, err: any) => reject(err)
            );
        });
    });
};

export const getActiveChapterForSaga = async (sagaId: string): Promise<Chapter | null> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM chapters WHERE sagaId = ? ORDER BY chapterNumber DESC LIMIT 1',
                [sagaId],
                (_: any, result: any) => {
                    const rows = result.rows._array;
                    resolve(rows.length > 0 ? (rows[0] as Chapter) : null);
                },
                (_: any, err: any) => reject(err)
            );
        });
    });
};