// ----------------------------
// src/services/captureService.ts
// ----------------------------
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Capture } from '../types/capture';
import { getActiveChapterForSaga } from './sagaService';

export const createCapture = async (capture: Omit<Capture, 'id' | 'createdAt' | 'updatedAt' | 'chapterId'>): Promise<void> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    const chapter = capture.sagaId ? await getActiveChapterForSaga(capture.sagaId) : null;
    const chapterId = chapter?.id ?? null;

    await executeSql(
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
        ]
    );
};

export const getCapturesBySaga = async (sagaId: string): Promise<Capture[]> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE sagaId = ? ORDER BY createdAt DESC',
        [sagaId]
    );

    let captures: Capture[] = [];

    // Check if result has rows property
    if (result && result.rows) {
        // Check if rows is an array or has _array property
        const rowsData = Array.isArray(result.rows) ? result.rows : result.rows._array;

        if (Array.isArray(rowsData)) {
            captures = rowsData.map((row: any) => ({
                ...row,
                tags: row.tags ? JSON.parse(row.tags) : [],
                linkedCaptureIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
                subActions: row.subActions ? JSON.parse(row.subActions) : [],
                done: Boolean(row.done),
            })) as Capture[];
        }
    }

    return captures;
};