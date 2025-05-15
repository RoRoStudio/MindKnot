// src/services/sparkService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Spark } from '../types/spark';

// Temporary function for migration
export const migrateSparksFromCaptures = async (): Promise<void> => {
    // Fetch all captures with subType SPARK
    const result = await executeSql(
        'SELECT * FROM captures WHERE subType = ?',
        ['spark']
    );

    if (!result || !result.rows || !result.rows._array) {
        console.log('No sparks to migrate');
        return;
    }

    // Process each spark capture and update type
    for (const capture of result.rows._array) {
        await executeSql(
            `UPDATE captures SET 
                type = ?, 
                subType = NULL,
                sagaId = NULL, 
                chapterId = NULL
             WHERE id = ?`,
            ['spark', capture.id]
        );
    }

    console.log(`Migrated ${result.rows._array.length} sparks from captures`);
};

export const createSpark = async (spark: Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Spark> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO captures (
            id, type, title, tags, body, linkedCaptureIds, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            'spark',
            spark.title,
            spark.tags ? JSON.stringify(spark.tags) : null,
            spark.body,
            spark.linkedEntryIds ? JSON.stringify(spark.linkedEntryIds) : null,
            now,
            now,
        ]
    );

    return {
        id,
        type: 'spark',
        title: spark.title,
        tags: spark.tags,
        body: spark.body,
        linkedEntryIds: spark.linkedEntryIds,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllSparks = async (): Promise<Spark[]> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE type = ? ORDER BY createdAt DESC',
        ['spark']
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedEntryIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
            type: 'spark'
        })) as Spark[];
    }

    return [];
};

export const getSparkById = async (id: string): Promise<Spark | null> => {
    const result = await executeSql(
        'SELECT * FROM captures WHERE id = ? AND type = ?',
        [id, 'spark']
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        const row = result.rows._array[0];
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedEntryIds: row.linkedCaptureIds ? JSON.parse(row.linkedCaptureIds) : [],
            type: 'spark'
        } as Spark;
    }

    return null;
};

export const updateSpark = async (id: string, updates: Partial<Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    const now = new Date().toISOString();
    const current = await getSparkById(id);

    if (!current) return false;

    const updatedSpark = {
        ...current,
        ...updates,
        updatedAt: now
    };

    try {
        await executeSql(
            `UPDATE captures SET 
                title = ?, 
                body = ?, 
                tags = ?,
                linkedCaptureIds = ?,
                updatedAt = ?
             WHERE id = ?`,
            [
                updatedSpark.title,
                updatedSpark.body,
                updatedSpark.tags ? JSON.stringify(updatedSpark.tags) : null,
                updatedSpark.linkedEntryIds ? JSON.stringify(updatedSpark.linkedEntryIds) : null,
                now,
                id
            ]
        );
        return true;
    } catch (error) {
        console.error('Error updating spark:', error);
        return false;
    }
};

export const deleteSpark = async (id: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM captures WHERE id = ? AND type = ?', [id, 'spark']);
        return true;
    } catch (error) {
        console.error('Error deleting spark:', error);
        return false;
    }
};

export const getUnlinkedSparks = async (): Promise<Spark[]> => {
    // Get sparks that aren't linked to any entries
    const result = await executeSql(
        `SELECT * FROM captures 
         WHERE type = ? 
         AND (linkedCaptureIds IS NULL OR linkedCaptureIds = '[]')
         ORDER BY createdAt DESC`,
        ['spark']
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedEntryIds: [],
            type: 'spark'
        })) as Spark[];
    }

    return [];
};