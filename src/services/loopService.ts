// src/services/loopService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Loop, LoopItem } from '../types/loop';

// Debug flag to control logging - set to false for production
const DEBUG_LOG = false;

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

    // Return the created loop
    return {
        id,
        type: 'loop',
        title: loop.title,
        description: loop.description,
        frequency: loop.frequency,
        startTimeByDay: loop.startTimeByDay,
        items: loop.items || [],
        tags: loop.tags || [],
        createdAt: now,
        updatedAt: now
    };
};

export const getAllLoops = async (): Promise<Loop[]> => {
    if (DEBUG_LOG) console.log("📣 Fetching all loops");
    try {
        const result = await executeSql(
            'SELECT * FROM loops ORDER BY createdAt DESC',
            []
        );

        if (DEBUG_LOG) console.log("📣 Loops query result:", result);

        if (result && result.rows && result.rows._array) {
            const loops = result.rows._array.map((row: any) => ({
                ...row,
                type: 'loop',
                tags: row.tags ? JSON.parse(row.tags) : [],
                startTimeByDay: row.startTimeByDay ? JSON.parse(row.startTimeByDay) : undefined,
            })) as Loop[];

            if (DEBUG_LOG) console.log(`📣 Found ${loops.length} loops`);

            // For each loop, fetch its items
            for (const loop of loops) {
                if (DEBUG_LOG) console.log(`📣 Fetching items for loop ${loop.id}`);
                const itemsResult = await executeSql(
                    'SELECT * FROM loop_items WHERE loopId = ? ORDER BY createdAt ASC',
                    [loop.id]
                );

                if (itemsResult && itemsResult.rows && itemsResult.rows._array) {
                    loop.items = itemsResult.rows._array as LoopItem[];
                    if (DEBUG_LOG) console.log(`📣 Found ${loop.items.length} items for loop ${loop.id}`);
                } else {
                    loop.items = [];
                    if (DEBUG_LOG) console.log(`📣 No items found for loop ${loop.id}`);
                }
            }

            return loops;
        }

        if (DEBUG_LOG) console.log("📣 No loops found");
        return [];
    } catch (error) {
        console.error("📣 Error fetching loops:", error);
        return [];
    }
};