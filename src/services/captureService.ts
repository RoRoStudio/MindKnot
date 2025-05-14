// src/services/captureService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Capture } from '../types/capture';
import { getActiveChapterForSaga } from './sagaService';

export const createCapture = async (capture: Omit<Capture, 'id' | 'createdAt' | 'updatedAt' | 'chapterId'>): Promise<Capture> => {
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

    // Return the newly created capture with its ID and timestamps
    return {
        id,
        type: 'capture',
        subType: capture.subType,
        title: capture.title,
        sagaId: capture.sagaId,
        chapterId: chapterId || undefined,
        tags: capture.tags,
        linkedCaptureIds: capture.linkedCaptureIds,
        body: capture.body,
        mood: capture.mood,
        prompt: capture.prompt,
        done: capture.done,
        dueDate: capture.dueDate,
        subActions: capture.subActions,
        createdAt: now,
        updatedAt: now
    };
};

export const getCapturesBySaga = async (sagaId: string): Promise<Capture[]> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE sagaId = ? ORDER BY createdAt DESC',
        [sagaId]
    );

    // Handle the result structure from our updated executeSql function
    if (result && result.rows && Array.isArray(result.rows)) {
        return result.rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedCaptureIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
        })) as Capture[];
    }

    return [];
};

export const getAllCaptures = async (): Promise<Capture[]> => {
    console.log('Fetching all captures...');

    const result = await executeSql(
        'SELECT * FROM captures ORDER BY createdAt DESC',
        []
    );

    // Check specifically for the rows structure from executeSql
    if (result && result.rows && result.rows._array) {
        console.log(`Found ${result.rows.length} captures in _array:`, result.rows._array);

        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedCaptureIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
            subActions: row.subActions ? JSON.parse(row.subActions) : [],
            done: Boolean(row.done),
        })) as Capture[];
    } else {
        console.log('No captures found or invalid result structure', result);
        return [];
    }
};

// Add more functions as needed