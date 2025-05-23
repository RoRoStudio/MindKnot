// src/api/sparkService.ts
import { executeSql } from './database';
import { generateUUID } from '../utils/uuidUtil';
import { Spark } from '../types/spark';

export const createSpark = async (spark: Omit<Spark, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Spark> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO sparks (
            id, title, tags, body, linkedEntryIds, categoryId, starred, hidden, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            spark.title,
            spark.tags ? JSON.stringify(spark.tags) : null,
            spark.body,
            spark.linkedEntryIds ? JSON.stringify(spark.linkedEntryIds) : null,
            spark.categoryId || null,
            spark.isStarred ? 1 : 0,
            false ? 1 : 0, // Default to not hidden
            now,
            now,
        ]
    );

    return {
        id,
        type: 'spark',
        title: spark.title,
        tags: spark.tags || [],
        body: spark.body,
        linkedEntryIds: spark.linkedEntryIds || [],
        categoryId: spark.categoryId,
        isStarred: spark.isStarred || false,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllSparks = async (): Promise<Spark[]> => {
    const result = await executeSql(
        'SELECT * FROM sparks WHERE hidden = 0 OR hidden IS NULL ORDER BY createdAt DESC',
        []
    );

    if (result && result.rows && result.rows._array) {
        return result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedEntryIds: row.linkedEntryIds ? JSON.parse(row.linkedEntryIds) : [],
            isStarred: Boolean(row.starred),
            type: 'spark'
        })) as Spark[];
    }

    return [];
};

export const getSparkById = async (id: string): Promise<Spark | null> => {
    const result = await executeSql(
        'SELECT * FROM sparks WHERE id = ?',
        [id]
    );

    if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
        const row = result.rows._array[0];
        return {
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            linkedEntryIds: row.linkedEntryIds ? JSON.parse(row.linkedEntryIds) : [],
            isStarred: Boolean(row.starred),
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
            `UPDATE sparks SET 
                title = ?, 
                body = ?, 
                tags = ?,
                linkedEntryIds = ?,
                categoryId = ?,
                starred = ?,
                hidden = ?,
                updatedAt = ?
             WHERE id = ?`,
            [
                updatedSpark.title,
                updatedSpark.body,
                updatedSpark.tags ? JSON.stringify(updatedSpark.tags) : null,
                updatedSpark.linkedEntryIds ? JSON.stringify(updatedSpark.linkedEntryIds) : null,
                updatedSpark.categoryId || null,
                updatedSpark.isStarred ? 1 : 0,
                (updates as any).hidden ? 1 : 0,
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
        await executeSql('DELETE FROM sparks WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting spark:', error);
        return false;
    }
};

export const getUnlinkedSparks = async (): Promise<Spark[]> => {
    // Get sparks that aren't linked to any entries
    const result = await executeSql(
        `SELECT * FROM sparks 
         WHERE linkedEntryIds IS NULL OR linkedEntryIds = '[]'
         ORDER BY createdAt DESC`,
        []
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