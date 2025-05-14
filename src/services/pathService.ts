// src/services/pathService.ts
import { executeSql } from '../database/database';
import { generateUUID } from '../utils/uuidUtil';
import { Path, Milestone, PathAction } from '../types/path';

export const createPath = async (path: Omit<Path, 'id' | 'createdAt' | 'updatedAt'>): Promise<Path> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        'INSERT INTO paths (id, title, description, startDate, targetDate, sagaId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            id,
            path.title,
            path.description ?? null,
            path.startDate ?? null,
            path.targetDate ?? null,
            path.sagaId ?? null,
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

            // If milestone has actions, create them as well
            if (milestone.actions && Array.isArray(milestone.actions) && milestone.actions.length > 0) {
                for (const action of milestone.actions) {
                    const actionId = await generateUUID();
                    await executeSql(
                        `INSERT INTO path_actions (id, milestoneId, name, description, done, dueDate,
                        sagaId, icon, subActions, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            actionId,
                            milestoneId,
                            action.name,
                            action.description ?? null,
                            action.done ? 1 : 0,
                            action.dueDate ?? null,
                            action.sagaId ?? null,
                            action.icon ?? null,
                            action.subActions ? JSON.stringify(action.subActions) : null,
                            now,
                            now
                        ]
                    );
                }
            }
        }
    }

    return { ...path, id, createdAt: now, updatedAt: now };
};

export const getPathsBySaga = async (sagaId: string): Promise<Path[]> => {
    const result = await executeSql(
        'SELECT * FROM paths WHERE sagaId = ? ORDER BY createdAt DESC',
        [sagaId]
    );

    // Check for valid result structure
    if (result && result.rows && Array.isArray(result.rows)) {
        const paths = result.rows as Path[];

        // For each path, fetch its milestones and actions
        for (const path of paths) {
            const milestonesResult = await executeSql(
                'SELECT * FROM milestones WHERE pathId = ? ORDER BY createdAt ASC',
                [path.id]
            );

            if (milestonesResult && milestonesResult.rows && Array.isArray(milestonesResult.rows)) {
                path.milestones = milestonesResult.rows as Milestone[];

                // For each milestone, fetch its actions
                for (const milestone of path.milestones) {
                    const actionsResult = await executeSql(
                        'SELECT * FROM path_actions WHERE milestoneId = ? ORDER BY createdAt ASC',
                        [milestone.id]
                    );

                    if (actionsResult && actionsResult.rows && Array.isArray(actionsResult.rows)) {
                        milestone.actions = actionsResult.rows.map((action: any) => ({
                            ...action,
                            done: Boolean(action.done),
                            subActions: action.subActions ? JSON.parse(action.subActions) : []
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

export const getAllPaths = async (): Promise<Path[]> => {
    const result = await executeSql(
        'SELECT * FROM paths ORDER BY createdAt DESC',
        []
    );

    // Check for valid result structure
    if (result && result.rows && Array.isArray(result.rows)) {
        const paths = result.rows as Path[];

        // For each path, fetch its milestones and actions
        for (const path of paths) {
            const milestonesResult = await executeSql(
                'SELECT * FROM milestones WHERE pathId = ? ORDER BY createdAt ASC',
                [path.id]
            );

            if (milestonesResult && milestonesResult.rows && Array.isArray(milestonesResult.rows)) {
                path.milestones = milestonesResult.rows as Milestone[];

                // For each milestone, fetch its actions
                for (const milestone of path.milestones) {
                    const actionsResult = await executeSql(
                        'SELECT * FROM path_actions WHERE milestoneId = ? ORDER BY createdAt ASC',
                        [milestone.id]
                    );

                    if (actionsResult && actionsResult.rows && Array.isArray(actionsResult.rows)) {
                        milestone.actions = actionsResult.rows.map((action: any) => ({
                            ...action,
                            done: Boolean(action.done),
                            subActions: action.subActions ? JSON.parse(action.subActions) : []
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