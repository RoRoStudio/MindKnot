// src/services/pathService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Path, Milestone } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

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

            // If milestone has action IDs, link them to the milestone
            if (milestone.actions && Array.isArray(milestone.actions) && milestone.actions.length > 0) {
                // Update each action to set parentId and parentType
                for (const actionId of milestone.actions) {
                    await executeSql(
                        `UPDATE captures 
                         SET parentId = ?, parentType = ?
                         WHERE id = ? AND type = ?`,
                        [
                            milestoneId,
                            'milestone',
                            actionId,
                            'action'
                        ]
                    );
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
        milestones: path.milestones,
        tags: path.tags,
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
        const paths = result.rows._array as Path[];

        // For each path, fetch its milestones
        for (const path of paths) {
            const milestonesResult = await executeSql(
                'SELECT * FROM milestones WHERE pathId = ? ORDER BY createdAt ASC',
                [path.id]
            );

            if (milestonesResult && milestonesResult.rows && milestonesResult.rows._array) {
                path.milestones = milestonesResult.rows._array as Milestone[];

                // For each milestone, fetch the linked action IDs
                for (const milestone of path.milestones) {
                    const actionsResult = await executeSql(
                        `SELECT id FROM captures 
                         WHERE parentId = ? AND parentType = ? AND type = ?
                         ORDER BY createdAt ASC`,
                        [milestone.id, 'milestone', 'action']
                    );

                    if (actionsResult && actionsResult.rows && actionsResult.rows._array) {
                        milestone.actions = actionsResult.rows._array.map(row => row.id);
                    } else {
                        milestone.actions = [];
                    }
                }
            } else {
                path.milestones = [];
            }

            // Add type field
            path.type = 'path';
        }

        return paths;
    }

    return [];
};