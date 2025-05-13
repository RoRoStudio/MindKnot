// ----------------------------
// src/services/loopService.ts
// ----------------------------
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Loop, LoopItem } from '../types/loop';

export const createLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loops (id, title, description, frequency, startTimeByDay, sagaId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loop.title,
            loop.description ?? null,
            loop.frequency,
            loop.startTimeByDay ? JSON.stringify(loop.startTimeByDay) : null,
            loop.sagaId ?? null,
            now,
            now
        ]
    );

    return { ...loop, id, createdAt: now, updatedAt: now };
};

export const getLoopsBySaga = async (sagaId: string): Promise<Loop[]> => {
    const result = await executeSql(
        'SELECT * FROM loops WHERE sagaId = ? ORDER BY createdAt DESC',
        [sagaId]
    );

    let loops: Loop[] = [];

    // Check if result has rows property
    if (result && result.rows) {
        // Check if rows is an array or has _array property
        const rowsData = Array.isArray(result.rows) ? result.rows : result.rows._array;

        if (Array.isArray(rowsData)) {
            loops = rowsData.map((row: any) => ({
                ...row,
                startTimeByDay: row.startTimeByDay ? JSON.parse(row.startTimeByDay) : undefined,
            })) as Loop[];
        }
    }

    return loops;
};