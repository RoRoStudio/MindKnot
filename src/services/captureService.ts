// ----------------------------
// src/services/captureService.ts
// ----------------------------
import db from '../database/database';
import { v4 as uuidv4 } from 'uuid';
import { Capture } from '../types/capture';
import { getActiveChapterForSaga } from './sagaService';

export const createCapture = async (capture: Omit<Capture, 'id' | 'createdAt' | 'updatedAt' | 'chapterId'>): Promise<void> => {
    const id = uuidv4();
    const now = new Date().toISOString();

    const chapter = capture.sagaId ? await getActiveChapterForSaga(capture.sagaId) : null;
    const chapterId = chapter?.id ?? null;

    await new Promise<void>((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                `INSERT INTO captures (
          id, type, subType, title, sagaId, chapterId, tags,
          linkedCaptureIds, body, mood, prompt, done, dueDate, subActions,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    'capture',
                    capture.subType ?? null,
                    capture.title ?? null,
                    capture.sagaId ?? null,
                    chapterId,
                    capture.tags ? JSON.stringify(capture.tags) : null,
                    capture.linkedCaptureIds ? JSON.stringify(capture.linkedCaptureIds) : null,
                    capture.body ?? null,
                    capture.mood ?? null,
                    capture.prompt ?? null,
                    capture.done ? 1 : 0,
                    capture.dueDate ?? null,
                    capture.subActions ? JSON.stringify(capture.subActions) : null,
                    now,
                    now,
                ],
                () => resolve(),
                (_: any, err: any) => reject(err)
            );
        });
    });
};

export const getCapturesBySaga = async (sagaId: string): Promise<Capture[]> => {
    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
                'SELECT * FROM captures WHERE sagaId = ? ORDER BY createdAt DESC',
                [sagaId],
                (_: any, result: any) => {
                    const rows = result.rows._array.map((row: any) => ({
                        ...row,
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        linkedCaptureIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
                        subActions: row.subActions ? JSON.parse(row.subActions) : [],
                        done: Boolean(row.done),
                    })) as Capture[];
                    resolve(rows);
                },
                (_: any, err: any) => reject(err)
            );
        });
    });
};
