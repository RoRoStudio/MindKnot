// src/services/loopService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Loop, LoopItem } from '../types/loop';

export const createLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loops (id, title, description, frequency, startTimeByDay, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loop.title,
            loop.description ?? null,
            loop.frequency,
            loop.startTimeByDay ? JSON.stringify(loop.startTimeByDay) : null,
            now,
            now
        ]
    );

    // If loop has items, create them as well
    if (loop.items && Array.isArray(loop.items) && loop.items.length > 0) {
        for (const item of loop.items) {
            const itemId = await generateUUID();
            await executeSql(
                `INSERT INTO loop_items (id, loopId, name, description, durationMinutes, 
                 quantity, icon, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemId,
                    id,
                    item.name,
                    item.description ?? null,
                    item.durationMinutes ?? null,
                    item.quantity ?? null,
                    item.icon ?? null,
                    now,
                    now
                ]
            );
        }
    }

    return { ...loop, id, createdAt: now, updatedAt: now };
};

export const getAllLoops = async (): Promise<Loop[]> => {
    const result = await executeSql(
        'SELECT * FROM loops ORDER BY createdAt DESC',
        []
    );

    // Check for valid result structure
    if (result && result.rows && Array.isArray(result.rows)) {
        const loops = result.rows.map((row: any) => ({
            ...row,
            startTimeByDay: row.startTimeByDay ? JSON.parse(row.startTimeByDay) : undefined,
        })) as Loop[];

        // For each loop, fetch its items
        for (const loop of loops) {
            const itemsResult = await executeSql(
                'SELECT * FROM loop_items WHERE loopId = ? ORDER BY createdAt ASC',
                [loop.id]
            );

            if (itemsResult && itemsResult.rows && Array.isArray(itemsResult.rows)) {
                loop.items = itemsResult.rows as LoopItem[];
            } else {
                loop.items = [];
            }
        }

        return loops;
    }

    return [];
};