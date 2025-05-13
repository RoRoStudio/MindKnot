// ----------------------------
// src/services/pathService.ts
// ----------------------------
import db from '../database/database';
import { v4 as uuidv4 } from 'uuid';
import { Path, Milestone, PathAction } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = uuidv4();
    const now = new Date().toISOString();

    await new Promise<void>((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'INSERT INTO paths (id, title, description, startDate, targetDate, sagaId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [id, path.title, path.description ?? null, path.startDate ?? null, path.targetDate ?? null, path.sagaId ?? null, now, now],
                () => resolve(),
                (_: any, err: any) => reject(err)
            );
        });
    });

    return { ...path, id, createdAt: now, updatedAt: now };
};

export const getPathsBySaga = async (sagaId: string): Promise<Path[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM paths WHERE sagaId = ? ORDER BY createdAt DESC',
                [sagaId],
                (_: any, result: any) => {
                    resolve(result.rows._array as Path[]);
                },
                (_: any, err: any) => reject(err)
            );
        });
    });
};