// ----------------------------
// src/services/pathService.ts
// ----------------------------
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Path, Milestone, PathAction } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        'INSERT INTO paths (id, title, description, startDate, targetDate, sagaId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id,
            path.title,
            path.description ?? null,
            path.startDate ?? null,
            path.targetDate ?? null,
            path.sagaId ?? null,
            now,
            now
        ]
    );

    return { ...path, id, createdAt: now, updatedAt: now };
};

export const getPathsBySaga = async (sagaId: string): Promise<Path[]> => {
    const result = await executeSql(
        'SELECT * FROM paths WHERE sagaId = ? ORDER BY createdAt DESC',
        [sagaId]
    );

    let paths: Path[] = [];

    // Check if result has rows property
    if (result && result.rows) {
        // Check if rows is an array or has _array property
        const rowsData = Array.isArray(result.rows) ? result.rows : result.rows._array;

        if (Array.isArray(rowsData)) {
            paths = rowsData as Path[];
        }
    }

    return paths;
};