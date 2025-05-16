// src/services/pathService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Path, Milestone } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    try {
        // First, check if the tags column exists in the paths table
        const tableInfoResult = await executeSql(
            "PRAGMA table_info(paths)",
            []
        );

        // Check if tags column exists in the table structure
        const hasTagsColumn = tableInfoResult.rows._array.some(
            (column: any) => column.name === 'tags'
        );

        // Insert path with or without tags column
        if (hasTagsColumn) {
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
        } else {
            // Insert without the tags column
            await executeSql(
                'INSERT INTO paths (id, title, description, startDate, targetDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    id,
                    path.title,
                    path.description ?? null,
                    path.startDate ?? null,
                    path.targetDate ?? null,
                    now,
                    now
                ]
            );

            // Optionally: Try to add the tags column to the table for future inserts
            try {
                await executeSql(
                    'ALTER TABLE paths ADD COLUMN tags TEXT',
                    []
                );
                console.log("Added tags column to paths table");
            } catch (alterError) {
                console.log("Could not add tags column:", alterError);
                // Continue without the column
            }
        }

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
    } catch (error) {
        console.error('Error creating path:', error);
        throw error;
    }
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

export const updatePath = async (
    pathId: string,
    pathData: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>
): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        // Update the path record
        await executeSql(
            `UPDATE paths SET 
            title = ?, 
            description = ?, 
            startDate = ?, 
            targetDate = ?, 
            tags = ?,
            updatedAt = ?
            WHERE id = ?`,
            [
                pathData.title,
                pathData.description || null,
                pathData.startDate || null,
                pathData.targetDate || null,
                pathData.tags ? JSON.stringify(pathData.tags) : null,
                now,
                pathId
            ]
        );

        // Handle milestones
        if (pathData.milestones && Array.isArray(pathData.milestones)) {
            // Get existing milestones to compare
            const existingMilestonesResult = await executeSql(
                'SELECT id FROM milestones WHERE pathId = ?',
                [pathId]
            );

            const existingMilestoneIds = existingMilestonesResult.rows._array.map((row: any) => row.id);
            const newMilestoneIds = pathData.milestones.map(m => m.id).filter(Boolean);

            // Delete milestones that are no longer present
            for (const existingId of existingMilestoneIds) {
                if (!newMilestoneIds.includes(existingId)) {
                    // First delete any associated actions
                    await executeSql(
                        'DELETE FROM actions WHERE parentId = ? AND parentType = ?',
                        [existingId, 'milestone']
                    );

                    // Then delete the milestone
                    await executeSql(
                        'DELETE FROM milestones WHERE id = ?',
                        [existingId]
                    );
                }
            }

            // Update or create milestones
            for (const milestone of pathData.milestones) {
                if (milestone.id && existingMilestoneIds.includes(milestone.id)) {
                    // Update existing milestone
                    await executeSql(
                        `UPDATE milestones SET 
                        title = ?, 
                        description = ?, 
                        updatedAt = ?
                        WHERE id = ?`,
                        [
                            milestone.title,
                            milestone.description || null,
                            now,
                            milestone.id
                        ]
                    );
                } else {
                    // Create new milestone
                    const milestoneId = milestone.id || await generateUUID();
                    await executeSql(
                        'INSERT INTO milestones (id, pathId, title, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
                        [
                            milestoneId,
                            pathId,
                            milestone.title,
                            milestone.description || null,
                            now,
                            now
                        ]
                    );

                    milestone.id = milestoneId;
                }

                // Handle actions for this milestone
                if (milestone.actions && Array.isArray(milestone.actions)) {
                    // Get existing actions for this milestone
                    const existingActionsResult = await executeSql(
                        'SELECT id FROM actions WHERE parentId = ? AND parentType = ?',
                        [milestone.id, 'milestone']
                    );

                    const existingActionIds = existingActionsResult.rows._array.map((row: any) => row.id);
                    const newActionIds = milestone.actions.map(a => a.id).filter(Boolean);

                    // Delete actions that are no longer present
                    for (const existingId of existingActionIds) {
                        if (!newActionIds.includes(existingId)) {
                            await executeSql(
                                'DELETE FROM actions WHERE id = ?',
                                [existingId]
                            );
                        }
                    }

                    // Update or create actions
                    for (const action of milestone.actions) {
                        if (action.id && existingActionIds.includes(action.id)) {
                            // Update existing action
                            await executeSql(
                                `UPDATE actions SET 
                                title = ?, 
                                body = ?, 
                                done = ?,
                                updatedAt = ?
                                WHERE id = ?`,
                                [
                                    action.name,
                                    action.description || null,
                                    action.done ? 1 : 0,
                                    now,
                                    action.id
                                ]
                            );
                        } else {
                            // Create new action
                            const actionId = action.id || await generateUUID();
                            await executeSql(
                                `INSERT INTO actions (
                                    id, title, body, done, parentId, parentType,
                                    createdAt, updatedAt
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    actionId,
                                    action.name,
                                    action.description || null,
                                    action.done ? 1 : 0,
                                    milestone.id,
                                    'milestone',
                                    now,
                                    now
                                ]
                            );
                        }
                    }
                }
            }
        }

        return true;
    } catch (error) {
        console.error('Error updating path:', error);
        return false;
    }
};

export const getPathById = async (id: string): Promise<Path | null> => {
    try {
        const result = await executeSql(
            'SELECT * FROM paths WHERE id = ?',
            [id]
        );

        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            const row = result.rows._array[0];
            const path: Path = {
                ...row,
                type: 'path',
                tags: row.tags ? JSON.parse(row.tags) : [],
                milestones: [] // Will be populated below
            };

            // Fetch milestones for this path
            const milestonesResult = await executeSql(
                'SELECT * FROM milestones WHERE pathId = ? ORDER BY createdAt ASC',
                [id]
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
            }

            return path;
        }

        return null;
    } catch (error) {
        console.error("Error fetching path by ID:", error);
        return null;
    }
};