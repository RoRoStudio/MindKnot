// src/services/pathService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Path, Milestone } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        'INSERT INTO paths (id, title, description, startDate, targetDate, tags, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id,
            path.title,
            path.description ?? null,
            path.startDate ?? null,
            path.targetDate ?? null,
            path.tags ? JSON.stringify(path.tags) : null,
            now,
            now
        ]
    );

    // If path has milestones, create them as well
    if (path.milestones && Array.isArray(path.milestones) && path.milestones.length > 0) {
        for (const milestone of path.milestones) {
            const milestoneId = await generateUUID();
            await executeSql(
                'INSERT INTO milestones (id, pathId, title, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    milestoneId,
                    id,
                    milestone.title,
                    milestone.description ?? null,
                    now,
                    now
                ]
            );

            // If milestone has actions, link them to the milestone
            if (milestone.actions && Array.isArray(milestone.actions)) {
                for (const action of milestone.actions) {
                    try {
                        // Create a new action record with the milestone as parent
                        if (typeof action === 'object' && action.id) {
                            const actionId = await generateUUID();
                            await executeSql(
                                `INSERT INTO actions (
                                    id, title, body, done, parentId, parentType,
                                    createdAt, updatedAt
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    actionId,
                                    action.name || 'Untitled Action',
                                    action.description || '',
                                    action.done ? 1 : 0,
                                    milestoneId,
                                    'milestone',
                                    now,
                                    now
                                ]
                            );
                        }
                    } catch (error) {
                        console.error('Error linking action to milestone:', error);
                    }
                }
            }
        }
    }

    return {
        id,
        type: 'path',
        title: path.title,
        description: path.description,
        startDate: path.startDate,
        targetDate: path.targetDate,
        milestones: path.milestones || [],
        tags: path.tags || [],
        createdAt: now,
        updatedAt: now
    };
};

export const getAllPaths = async (): Promise<Path[]> => {
    const result = await executeSql(
        'SELECT * FROM paths ORDER BY createdAt DESC',
        []
    );

    if (result && result.rows && result.rows._array) {
        const paths = result.rows._array.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : [],
            type: 'path'
        })) as Path[];

        // For each path, fetch its milestones
        for (const path of paths) {
            const milestonesResult = await executeSql(
                'SELECT * FROM milestones WHERE pathId = ? ORDER BY createdAt ASC',
                [path.id]
            );

            if (milestonesResult && milestonesResult.rows && milestonesResult.rows._array) {
                path.milestones = milestonesResult.rows._array as Milestone[];

                // For each milestone, fetch the linked actions
                for (const milestone of path.milestones) {
                    const actionsResult = await executeSql(
                        `SELECT * FROM actions 
                         WHERE parentId = ? AND parentType = ?
                         ORDER BY createdAt ASC`,
                        [milestone.id, 'milestone']
                    );

                    if (actionsResult && actionsResult.rows && actionsResult.rows._array) {
                        milestone.actions = actionsResult.rows._array.map(action => ({
                            id: action.id,
                            name: action.title,
                            description: action.body,
                            done: Boolean(action.done)
                        }));
                    } else {
                        milestone.actions = [];
                    }
                }
            } else {
                path.milestones = [];
            }
        }

        return paths;
    }

    return [];
};