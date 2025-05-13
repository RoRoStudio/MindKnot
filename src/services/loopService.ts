// ----------------------------
// src/services/loopService.ts
// ----------------------------
import db from '../database/database';
import { v4 as uuidv4 } from 'uuid';
import { Loop, LoopItem } from '../types/loop';

export const createLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop> => {
    const id = uuidv4();
    const now = new Date().toISOString();

    await new Promise<void>((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                `INSERT INTO loops (id, title, description, frequency, startTimeByDay, sagaId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, loop.title, loop.description ?? null, loop.frequency, loop.startTimeByDay ? JSON.stringify(loop.startTimeByDay) : null, loop.sagaId ?? null, now, now],
                () => resolve(),
                (_: any, err: any) => reject(err)
            );
        });
    });

    return { ...loop, id, createdAt: now, updatedAt: now };
};

export const getLoopsBySaga = async (sagaId: string): Promise<Loop[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM loops WHERE sagaId = ? ORDER BY createdAt DESC',
                [sagaId],
                (_: any, result: any) => {
                    const loops = result.rows._array.map((row: any) => ({
                        ...row,
                        startTimeByDay: row.startTimeByDay ? JSON.parse(row.startTimeByDay) : undefined,
                    })) as Loop[];
                    resolve(loops);
                },
                (_: any, err: any) => reject(err)
            );
        });
    });
};