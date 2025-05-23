// src/api/loopService.ts
import { executeSql } from './database';
import { generateUUID } from '../utils/uuidUtil';
import { Loop, LoopItem } from '../types/loop';

// Debug flag to control logging - set to false for production
const DEBUG_LOG = false;

export const createLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loops (id, title, description, frequency, startTimeByDay, active, startDate, endDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loop.title,
            loop.description ?? null,
            loop.frequency,
            loop.startTimeByDay ? JSON.stringify(loop.startTimeByDay) : null,
            loop.active ? 1 : 0,
            loop.startDate,
            loop.endDate || null,
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
        active: loop.active,
        startDate: loop.startDate,
        endDate: loop.endDate,
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
                active: Boolean(row.active),
                startDate: row.startDate || new Date().toISOString(), // Default to current date if not set
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

        if (DEBUG_LOG) console.log("�� No loops found");
        return [];
    } catch (error) {
        console.error("📣 Error fetching loops:", error);
        return [];
    }
};

export const updateLoop = async (
    loopId: string,
    loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        // Update the loop record
        await executeSql(
            `UPDATE loops SET 
            title = ?, 
            description = ?, 
            frequency = ?,
            startTimeByDay = ?,
            active = ?,
            startDate = ?,
            endDate = ?,
            tags = ?,
            updatedAt = ?
            WHERE id = ?`,
            [
                loopData.title,
                loopData.description || null,
                loopData.frequency,
                loopData.startTimeByDay ? JSON.stringify(loopData.startTimeByDay) : null,
                loopData.active ? 1 : 0,
                loopData.startDate,
                loopData.endDate || null,
                loopData.tags ? JSON.stringify(loopData.tags) : null,
                now,
                loopId
            ]
        );

        // Handle loop items
        if (loopData.items && Array.isArray(loopData.items)) {
            // Get existing items to compare
            const existingItemsResult = await executeSql(
                'SELECT id FROM loop_items WHERE loopId = ?',
                [loopId]
            );

            const existingItemIds = existingItemsResult.rows._array.map((row: any) => row.id);
            const newItemIds = loopData.items.map(i => i.id).filter(Boolean);

            // Delete items that are no longer present
            for (const existingId of existingItemIds) {
                if (!newItemIds.includes(existingId)) {
                    await executeSql(
                        'DELETE FROM loop_items WHERE id = ?',
                        [existingId]
                    );
                }
            }

            // Update or create items
            for (const item of loopData.items) {
                if (item.id && existingItemIds.includes(item.id)) {
                    // Update existing item
                    await executeSql(
                        `UPDATE loop_items SET 
                        name = ?, 
                        description = ?,
                        durationMinutes = ?,
                        quantity = ?,
                        icon = ?,
                        updatedAt = ?
                        WHERE id = ?`,
                        [
                            item.name,
                            item.description || null,
                            item.durationMinutes || null,
                            item.quantity || null,
                            item.icon || null,
                            now,
                            item.id
                        ]
                    );
                } else {
                    // Create new item
                    const itemId = item.id || await generateUUID();
                    await executeSql(
                        `INSERT INTO loop_items (
                            id, loopId, name, description, durationMinutes, 
                            quantity, icon, createdAt, updatedAt
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            itemId,
                            loopId,
                            item.name,
                            item.description || null,
                            item.durationMinutes || null,
                            item.quantity || null,
                            item.icon || null,
                            now,
                            now
                        ]
                    );
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Error updating loop:', error);
        return false;
    }
};

export const getLoopById = async (id: string): Promise<Loop | null> => {
    try {
        const result = await executeSql(
            'SELECT * FROM loops WHERE id = ?',
            [id]
        );

        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            const row = result.rows._array[0];
            const loop: Loop = {
                ...row,
                type: 'loop',
                tags: row.tags ? JSON.parse(row.tags) : [],
                startTimeByDay: row.startTimeByDay ? JSON.parse(row.startTimeByDay) : undefined,
                active: Boolean(row.active),
                startDate: row.startDate || new Date().toISOString(), // Default to current date if not set
                items: [] // Will be populated below
            };

            // Fetch items for this loop
            const itemsResult = await executeSql(
                'SELECT * FROM loop_items WHERE loopId = ? ORDER BY createdAt ASC',
                [id]
            );

            if (itemsResult && itemsResult.rows && itemsResult.rows._array) {
                loop.items = itemsResult.rows._array as LoopItem[];
            }

            return loop;
        }

        return null;
    } catch (error) {
        console.error("Error fetching loop by ID:", error);
        return null;
    }
};

export const deleteLoop = async (id: string): Promise<boolean> => {
    try {
        // First delete all loop items associated with this loop
        await executeSql('DELETE FROM loop_items WHERE loopId = ?', [id]);

        // Then delete the loop itself
        await executeSql('DELETE FROM loops WHERE id = ?', [id]);

        return true;
    } catch (error) {
        console.error('Error deleting loop:', error);
        return false;
    }
};