// src/api/loopService.ts
import { executeSql } from './database';
import { generateUUID } from '../utils/uuidUtil';
import {
    Loop,
    LoopItem,
    ActivityTemplate,
    LoopActivityInstance,
    LoopExecutionState,
    NavigateTarget,
    ActivityExecutionResult,
    ActivityQuantity,
    ActivitySubAction,
    LoopActivity // Legacy support
} from '../types/loop';

// Debug flag to control logging - set to false for production
const DEBUG_LOG = false;

// =====================
// ACTIVITY TEMPLATES
// =====================

export const createActivityTemplate = async (
    template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActivityTemplate> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO activity_templates (id, title, icon, description, type, navigateTarget, isPredefined, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            template.title,
            template.icon,
            template.description || null,
            template.type || null,
            template.navigateTarget ? JSON.stringify(template.navigateTarget) : null,
            template.isPredefined ? 1 : 0,
            now,
            now
        ]
    );

    return {
        id,
        title: template.title,
        icon: template.icon,
        description: template.description,
        type: template.type,
        navigateTarget: template.navigateTarget,
        isPredefined: template.isPredefined,
        createdAt: now,
        updatedAt: now
    };
};

export const getAllActivityTemplates = async (): Promise<ActivityTemplate[]> => {
    try {
        const result = await executeSql(
            'SELECT * FROM activity_templates ORDER BY isPredefined DESC, title ASC',
            []
        );

        if (result && result.rows && result.rows._array) {
            return result.rows._array.map((row: any) => ({
                ...row,
                description: row.description || undefined,
                type: row.type || undefined,
                navigateTarget: row.navigateTarget ? JSON.parse(row.navigateTarget) : undefined,
                isPredefined: Boolean(row.isPredefined)
            })) as ActivityTemplate[];
        }

        return [];
    } catch (error) {
        console.error("Error fetching activity templates:", error);
        return [];
    }
};

export const getActivityTemplateById = async (id: string): Promise<ActivityTemplate | null> => {
    try {
        const result = await executeSql(
            'SELECT * FROM activity_templates WHERE id = ?',
            [id]
        );

        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            const row = result.rows._array[0];
            return {
                ...row,
                description: row.description || undefined,
                type: row.type || undefined,
                navigateTarget: row.navigateTarget ? JSON.parse(row.navigateTarget) : undefined,
                isPredefined: Boolean(row.isPredefined)
            } as ActivityTemplate;
        }

        return null;
    } catch (error) {
        console.error("Error fetching activity template:", error);
        return null;
    }
};

export const updateActivityTemplate = async (
    id: string,
    updates: Partial<Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        await executeSql(
            `UPDATE activity_templates SET 
             title = COALESCE(?, title),
             icon = COALESCE(?, icon),
             description = COALESCE(?, description),
             type = COALESCE(?, type),
             navigateTarget = COALESCE(?, navigateTarget),
             isPredefined = COALESCE(?, isPredefined),
             updatedAt = ?
             WHERE id = ?`,
            [
                updates.title || null,
                updates.icon || null,
                updates.description || null,
                updates.type || null,
                updates.navigateTarget ? JSON.stringify(updates.navigateTarget) : null,
                updates.isPredefined !== undefined ? (updates.isPredefined ? 1 : 0) : null,
                now,
                id
            ]
        );

        return true;
    } catch (error) {
        console.error("Error updating activity template:", error);
        return false;
    }
};

export const deleteActivityTemplate = async (id: string): Promise<boolean> => {
    try {
        // Check if template is used in any loops
        const usageResult = await executeSql(
            'SELECT COUNT(*) as count FROM loop_activity_instances WHERE templateId = ?',
            [id]
        );

        if (usageResult.rows._array[0].count > 0) {
            throw new Error('Cannot delete activity template that is in use');
        }

        await executeSql('DELETE FROM activity_templates WHERE id = ? AND isPredefined = 0', [id]);
        return true;
    } catch (error) {
        console.error("Error deleting activity template:", error);
        return false;
    }
};

// =====================
// LOOP ACTIVITY INSTANCES
// =====================

export const createLoopActivityInstance = async (
    loopId: string,
    instance: Omit<LoopActivityInstance, 'id'>
): Promise<LoopActivityInstance> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loop_activity_instances (
            id, loopId, templateId, overriddenTitle, quantityValue, quantityUnit, 
            durationMinutes, subActions, navigateTarget, \`order\`, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loopId,
            instance.templateId,
            instance.overriddenTitle || null,
            instance.quantity?.value || null,
            instance.quantity?.unit || null,
            instance.durationMinutes || null,
            instance.subActions ? JSON.stringify(instance.subActions) : null,
            instance.navigateTarget ? JSON.stringify(instance.navigateTarget) : null,
            instance.order,
            now,
            now
        ]
    );

    return {
        id,
        templateId: instance.templateId,
        overriddenTitle: instance.overriddenTitle,
        quantity: instance.quantity,
        durationMinutes: instance.durationMinutes,
        subActions: instance.subActions,
        navigateTarget: instance.navigateTarget,
        order: instance.order
    };
};

export const getLoopActivityInstances = async (loopId: string): Promise<LoopActivityInstance[]> => {
    try {
        const result = await executeSql(
            'SELECT * FROM loop_activity_instances WHERE loopId = ? ORDER BY `order` ASC',
            [loopId]
        );

        if (result && result.rows && result.rows._array) {
            return result.rows._array.map((row: any) => ({
                id: row.id,
                templateId: row.templateId,
                overriddenTitle: row.overriddenTitle || undefined,
                quantity: (row.quantityValue && row.quantityUnit) ? {
                    value: row.quantityValue,
                    unit: row.quantityUnit
                } : undefined,
                durationMinutes: row.durationMinutes || undefined,
                subActions: row.subActions ? JSON.parse(row.subActions) : undefined,
                navigateTarget: row.navigateTarget ? JSON.parse(row.navigateTarget) : undefined,
                order: row.order
            })) as LoopActivityInstance[];
        }

        return [];
    } catch (error) {
        console.error("Error fetching loop activity instances:", error);
        return [];
    }
};

export const updateLoopActivityInstance = async (
    instanceId: string,
    updates: Partial<Omit<LoopActivityInstance, 'id'>>
): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        await executeSql(
            `UPDATE loop_activity_instances SET 
             templateId = COALESCE(?, templateId),
             overriddenTitle = COALESCE(?, overriddenTitle),
             quantityValue = COALESCE(?, quantityValue),
             quantityUnit = COALESCE(?, quantityUnit),
             durationMinutes = COALESCE(?, durationMinutes),
             subActions = COALESCE(?, subActions),
             navigateTarget = COALESCE(?, navigateTarget),
             \`order\` = COALESCE(?, \`order\`),
             updatedAt = ?
             WHERE id = ?`,
            [
                updates.templateId || null,
                updates.overriddenTitle || null,
                updates.quantity?.value || null,
                updates.quantity?.unit || null,
                updates.durationMinutes || null,
                updates.subActions ? JSON.stringify(updates.subActions) : null,
                updates.navigateTarget ? JSON.stringify(updates.navigateTarget) : null,
                updates.order !== undefined ? updates.order : null,
                now,
                instanceId
            ]
        );

        return true;
    } catch (error) {
        console.error("Error updating loop activity instance:", error);
        return false;
    }
};

export const deleteLoopActivityInstance = async (instanceId: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM loop_activity_instances WHERE id = ?', [instanceId]);
        return true;
    } catch (error) {
        console.error("Error deleting loop activity instance:", error);
        return false;
    }
};

export const reorderLoopActivityInstances = async (
    loopId: string,
    instanceOrders: { id: string; order: number }[]
): Promise<boolean> => {
    try {
        const now = new Date().toISOString();

        for (const { id, order } of instanceOrders) {
            await executeSql(
                'UPDATE loop_activity_instances SET `order` = ?, updatedAt = ? WHERE id = ? AND loopId = ?',
                [order, now, id, loopId]
            );
        }

        return true;
    } catch (error) {
        console.error("Error reordering loop activity instances:", error);
        return false;
    }
};

// =====================
// LOOP EXECUTION STATE
// =====================

export const saveLoopExecutionState = async (state: LoopExecutionState): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        // First check if state already exists
        const existingResult = await executeSql(
            'SELECT id FROM loop_execution_state WHERE loopId = ?',
            [state.loopId]
        );

        if (existingResult.rows._array.length > 0) {
            // Update existing state
            await executeSql(
                `UPDATE loop_execution_state SET 
                 currentActivityIndex = ?,
                 startedAt = ?,
                 completedActivities = ?,
                 completedSubActions = ?,
                 isPaused = ?,
                 pausedAt = ?,
                 timeSpentSeconds = ?,
                 activityTimeTracking = ?,
                 updatedAt = ?
                 WHERE loopId = ?`,
                [
                    state.currentActivityIndex,
                    state.startedAt,
                    JSON.stringify(state.completedActivities),
                    JSON.stringify(state.completedSubActions),
                    state.isPaused ? 1 : 0,
                    state.pausedAt || null,
                    state.timeSpentSeconds,
                    JSON.stringify(state.activityTimeTracking),
                    now,
                    state.loopId
                ]
            );
        } else {
            // Create new state
            const id = await generateUUID();
            await executeSql(
                `INSERT INTO loop_execution_state (
                    id, loopId, currentActivityIndex, startedAt, completedActivities, 
                    completedSubActions, isPaused, pausedAt, timeSpentSeconds, 
                    activityTimeTracking, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    state.loopId,
                    state.currentActivityIndex,
                    state.startedAt,
                    JSON.stringify(state.completedActivities),
                    JSON.stringify(state.completedSubActions),
                    state.isPaused ? 1 : 0,
                    state.pausedAt || null,
                    state.timeSpentSeconds,
                    JSON.stringify(state.activityTimeTracking),
                    now,
                    now
                ]
            );
        }

        return true;
    } catch (error) {
        console.error("Error saving loop execution state:", error);
        return false;
    }
};

export const getLoopExecutionState = async (loopId: string): Promise<LoopExecutionState | null> => {
    try {
        const result = await executeSql(
            'SELECT * FROM loop_execution_state WHERE loopId = ?',
            [loopId]
        );

        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            const row = result.rows._array[0];
            return {
                id: row.id,
                loopId: row.loopId,
                currentActivityIndex: row.currentActivityIndex,
                startedAt: row.startedAt,
                completedActivities: row.completedActivities ? JSON.parse(row.completedActivities) : [],
                completedSubActions: row.completedSubActions ? JSON.parse(row.completedSubActions) : {},
                isPaused: Boolean(row.isPaused),
                pausedAt: row.pausedAt,
                timeSpentSeconds: row.timeSpentSeconds || 0,
                activityTimeTracking: row.activityTimeTracking ? JSON.parse(row.activityTimeTracking) : {}
            };
        }

        return null;
    } catch (error) {
        console.error("Error fetching loop execution state:", error);
        return null;
    }
};

export const clearLoopExecutionState = async (loopId: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM loop_execution_state WHERE loopId = ?', [loopId]);
        return true;
    } catch (error) {
        console.error("Error clearing loop execution state:", error);
        return false;
    }
};

// =====================
// ENHANCED LOOP OPERATIONS
// =====================

export const createLoop = async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loop> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loops (id, title, description, frequency, startTimeByDay, active, startDate, endDate, tags, categoryId, starred, hidden, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loop.title,
            loop.description ?? null,
            loop.frequency || null,
            loop.startTimeByDay ? JSON.stringify(loop.startTimeByDay) : null,
            loop.active ? 1 : 0,
            loop.startDate || null,
            loop.endDate || null,
            loop.tags ? JSON.stringify(loop.tags) : null,
            loop.categoryId || null,
            loop.isStarred ? 1 : 0,
            0, // hidden
            now,
            now
        ]
    );

    // Create activity instances if provided
    if (loop.activityInstances && Array.isArray(loop.activityInstances) && loop.activityInstances.length > 0) {
        for (const instance of loop.activityInstances) {
            await createLoopActivityInstance(id, instance);
        }
    }

    // Legacy support: Create activities if provided
    if (loop.activities && Array.isArray(loop.activities) && loop.activities.length > 0) {
        for (let i = 0; i < loop.activities.length; i++) {
            const activity = loop.activities[i];
            await createLoopActivity(id, {
                baseActivityId: activity.baseActivityId,
                durationSeconds: activity.durationSeconds,
                subActions: activity.subActions,
                navigateTarget: activity.navigateTarget,
                order: activity.order || i
            });
        }
    }

    // Legacy support: If loop has items, create them as well
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
        activityInstances: loop.activityInstances || [],
        activities: loop.activities || [],
        items: loop.items || [],
        tags: loop.tags || [],
        categoryId: loop.categoryId,
        isStarred: loop.isStarred,
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
                isStarred: Boolean(row.starred),
                startDate: row.startDate || new Date().toISOString(),
                currentActivityIndex: row.currentActivityIndex || 0,
                isExecuting: Boolean(row.isExecuting),
                lastExecutionDate: row.lastExecutionDate,
            })) as Loop[];

            if (DEBUG_LOG) console.log(`📣 Found ${loops.length} loops`);

            // For each loop, fetch its activity instances and legacy data
            for (const loop of loops) {
                // Fetch new activity instances
                loop.activityInstances = await getLoopActivityInstances(loop.id);

                // Fetch legacy activities for backward compatibility
                loop.activities = await getLoopActivities(loop.id);

                // Fetch legacy items for backward compatibility
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

                // Fetch execution state if loop is executing
                if (loop.isExecuting) {
                    // Note: executionState will be fetched separately when needed
                    // to avoid circular dependencies in the base loop structure
                }
            }

            return loops;
        }

        if (DEBUG_LOG) console.log("🔄 No loops found");
        return [];
    } catch (error) {
        console.error("📣 Error fetching loops:", error);
        return [];
    }
};

// Legacy function for backward compatibility
export const createLoopActivity = async (
    loopId: string,
    activity: Omit<LoopActivity, 'id'>
): Promise<LoopActivity> => {
    const id = await generateUUID();
    const now = new Date().toISOString();

    await executeSql(
        `INSERT INTO loop_activities (id, loopId, baseActivityId, durationSeconds, subActions, navigateTarget, \`order\`, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id,
            loopId,
            activity.baseActivityId,
            activity.durationSeconds || null,
            activity.subActions ? JSON.stringify(activity.subActions) : null,
            activity.navigateTarget ? JSON.stringify(activity.navigateTarget) : null,
            activity.order,
            now,
            now
        ]
    );

    return {
        id,
        baseActivityId: activity.baseActivityId,
        durationSeconds: activity.durationSeconds,
        subActions: activity.subActions,
        navigateTarget: activity.navigateTarget,
        order: activity.order
    };
};

export const getLoopActivities = async (loopId: string): Promise<LoopActivity[]> => {
    try {
        const result = await executeSql(
            'SELECT * FROM loop_activities WHERE loopId = ? ORDER BY `order` ASC',
            [loopId]
        );

        if (result && result.rows && result.rows._array) {
            return result.rows._array.map((row: any) => ({
                id: row.id,
                baseActivityId: row.baseActivityId,
                durationSeconds: row.durationSeconds,
                subActions: row.subActions ? JSON.parse(row.subActions) : undefined,
                navigateTarget: row.navigateTarget ? JSON.parse(row.navigateTarget) : undefined,
                order: row.order
            })) as LoopActivity[];
        }

        return [];
    } catch (error) {
        console.error("Error fetching loop activities:", error);
        return [];
    }
};

export const updateLoopActivity = async (
    activityId: string,
    updates: Partial<Omit<LoopActivity, 'id'>>
): Promise<boolean> => {
    const now = new Date().toISOString();

    try {
        await executeSql(
            `UPDATE loop_activities SET 
             baseActivityId = COALESCE(?, baseActivityId),
             durationSeconds = COALESCE(?, durationSeconds),
             subActions = COALESCE(?, subActions),
             navigateTarget = COALESCE(?, navigateTarget),
             \`order\` = COALESCE(?, \`order\`),
             updatedAt = ?
             WHERE id = ?`,
            [
                updates.baseActivityId || null,
                updates.durationSeconds || null,
                updates.subActions ? JSON.stringify(updates.subActions) : null,
                updates.navigateTarget ? JSON.stringify(updates.navigateTarget) : null,
                updates.order !== undefined ? updates.order : null,
                now,
                activityId
            ]
        );

        return true;
    } catch (error) {
        console.error("Error updating loop activity:", error);
        return false;
    }
};

export const deleteLoopActivity = async (activityId: string): Promise<boolean> => {
    try {
        await executeSql('DELETE FROM loop_activities WHERE id = ?', [activityId]);
        return true;
    } catch (error) {
        console.error("Error deleting loop activity:", error);
        return false;
    }
};

export const reorderLoopActivities = async (
    loopId: string,
    activityOrders: { id: string; order: number }[]
): Promise<boolean> => {
    try {
        const now = new Date().toISOString();

        for (const { id, order } of activityOrders) {
            await executeSql(
                'UPDATE loop_activities SET `order` = ?, updatedAt = ? WHERE id = ? AND loopId = ?',
                [order, now, id, loopId]
            );
        }

        return true;
    } catch (error) {
        console.error("Error reordering loop activities:", error);
        return false;
    }
};

// Continue with remaining functions...
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

        // Handle activity instances
        if (loopData.activityInstances && Array.isArray(loopData.activityInstances)) {
            // Delete existing instances
            await executeSql('DELETE FROM loop_activity_instances WHERE loopId = ?', [loopId]);

            // Create new instances
            for (const instance of loopData.activityInstances) {
                await createLoopActivityInstance(loopId, instance);
            }
        }

        // Handle legacy items
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
                startDate: row.startDate || new Date().toISOString(),
                items: [], // Will be populated below
                activities: [], // Legacy support
                activityInstances: [] // New structure
            };

            // Fetch activity instances (new structure)
            loop.activityInstances = await getLoopActivityInstances(loop.id);

            // Fetch legacy items for this loop (for backward compatibility)
            const itemsResult = await executeSql(
                'SELECT * FROM loop_items WHERE loopId = ? ORDER BY createdAt ASC',
                [id]
            );

            if (itemsResult && itemsResult.rows && itemsResult.rows._array) {
                loop.items = itemsResult.rows._array as LoopItem[];
            }

            // Fetch legacy activities for this loop (new activity-based approach)
            loop.activities = await getLoopActivities(id);

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
        // Delete all activity instances associated with this loop
        await executeSql('DELETE FROM loop_activity_instances WHERE loopId = ?', [id]);

        // Delete all loop activities associated with this loop (legacy)
        await executeSql('DELETE FROM loop_activities WHERE loopId = ?', [id]);

        // Delete all loop items associated with this loop (legacy)
        await executeSql('DELETE FROM loop_items WHERE loopId = ?', [id]);

        // Delete execution state if any
        await clearLoopExecutionState(id);

        // Then delete the loop itself
        await executeSql('DELETE FROM loops WHERE id = ?', [id]);

        return true;
    } catch (error) {
        console.error('Error deleting loop:', error);
        return false;
    }
};

// Function to start loop execution
export const startLoopExecution = async (loopId: string): Promise<boolean> => {
    try {
        const now = new Date().toISOString();

        // Update loop status
        await executeSql(
            'UPDATE loops SET isExecuting = 1, lastExecutionDate = ?, currentActivityIndex = 0, updatedAt = ? WHERE id = ?',
            [now, now, loopId]
        );

        // Create execution state
        const executionState: LoopExecutionState = {
            loopId,
            currentActivityIndex: 0,
            startedAt: now,
            completedActivities: [],
            completedSubActions: {},
            isPaused: false,
            timeSpentSeconds: 0,
            activityTimeTracking: {}
        };

        await saveLoopExecutionState(executionState);

        return true;
    } catch (error) {
        console.error("Error starting loop execution:", error);
        return false;
    }
};

// Function to complete loop execution
export const completeLoopExecution = async (loopId: string): Promise<boolean> => {
    try {
        const now = new Date().toISOString();

        // Update loop status
        await executeSql(
            'UPDATE loops SET isExecuting = 0, currentActivityIndex = 0, updatedAt = ? WHERE id = ?',
            [now, loopId]
        );

        // Clear execution state
        await clearLoopExecutionState(loopId);

        return true;
    } catch (error) {
        console.error("Error completing loop execution:", error);
        return false;
    }
};

// Function to pause/resume loop execution
export const pauseLoopExecution = async (loopId: string, isPaused: boolean): Promise<boolean> => {
    try {
        const executionState = await getLoopExecutionState(loopId);
        if (!executionState) return false;

        executionState.isPaused = isPaused;
        executionState.pausedAt = isPaused ? new Date().toISOString() : undefined;

        await saveLoopExecutionState(executionState);

        return true;
    } catch (error) {
        console.error("Error pausing/resuming loop execution:", error);
        return false;
    }
};

// Function to advance to next activity
export const advanceLoopActivity = async (
    loopId: string,
    activityResult: ActivityExecutionResult
): Promise<boolean> => {
    try {
        const executionState = await getLoopExecutionState(loopId);
        if (!executionState) return false;

        // Add completed activity
        if (activityResult.completed && !activityResult.skipped) {
            executionState.completedActivities.push(activityResult.activityId);
        }

        // Track completed sub-actions
        if (activityResult.completedSubActions.length > 0) {
            executionState.completedSubActions[activityResult.activityId] = activityResult.completedSubActions;
        }

        // Track time spent
        executionState.timeSpentSeconds += activityResult.timeSpentSeconds;
        executionState.activityTimeTracking[activityResult.activityId] = activityResult.timeSpentSeconds;

        // Advance to next activity
        executionState.currentActivityIndex += 1;

        // Save updated state
        await saveLoopExecutionState(executionState);

        // Update loop current activity index
        const now = new Date().toISOString();
        await executeSql(
            'UPDATE loops SET currentActivityIndex = ?, updatedAt = ? WHERE id = ?',
            [executionState.currentActivityIndex, now, loopId]
        );

        return true;
    } catch (error) {
        console.error("Error advancing loop activity:", error);
        return false;
    }
};

// Function to get predefined activity templates
export const initializePredefinedActivityTemplates = async (): Promise<void> => {
    try {
        // Check if templates already exist
        const existingTemplates = await getAllActivityTemplates();
        if (existingTemplates.some(t => t.isPredefined)) {
            if (DEBUG_LOG) console.log('Predefined activity templates already exist');
            return;
        }

        const predefinedTemplates: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
            // Mind category - with navigation targets
            {
                title: 'Create Note',
                icon: '📝',
                description: 'Write down thoughts or ideas',
                type: 'mind',
                isPredefined: true,
                navigateTarget: { type: 'note', mode: 'create' }
            },
            {
                title: 'Review Notes',
                icon: '📖',
                description: 'Look through your saved notes',
                type: 'mind',
                isPredefined: true,
                navigateTarget: { type: 'note', mode: 'review', filter: { starred: true } }
            },
            {
                title: 'Meditation',
                icon: '🧘',
                description: 'Mindfulness and breathing practice',
                type: 'mind',
                isPredefined: true
            },
            {
                title: 'Gratitude Practice',
                icon: '🙏',
                description: 'Reflect on things you\'re grateful for',
                type: 'mind',
                isPredefined: true
            },
            {
                title: 'Reflection',
                icon: '💭',
                description: 'Think about your day or experiences',
                type: 'mind',
                isPredefined: true
            },

            // Body category
            {
                title: 'Stretch',
                icon: '🤸',
                description: 'Simple stretching routine',
                type: 'body',
                isPredefined: true
            },
            {
                title: 'Exercise',
                icon: '💪',
                description: 'Physical workout or activity',
                type: 'body',
                isPredefined: true
            },
            {
                title: 'Hydrate',
                icon: '💧',
                description: 'Drink water',
                type: 'body',
                isPredefined: true
            },
            {
                title: 'Take Vitamins',
                icon: '💊',
                description: 'Take daily supplements',
                type: 'body',
                isPredefined: true
            },
            {
                title: 'Breathe',
                icon: '🫁',
                description: 'Breathing exercises',
                type: 'body',
                isPredefined: true
            },

            // Planning category - with navigation targets
            {
                title: 'Work on Actions',
                icon: '✅',
                description: 'Complete pending tasks',
                type: 'planning',
                isPredefined: true,
                navigateTarget: { type: 'action', mode: 'select', filter: { done: false } }
            },
            {
                title: 'Set Priorities',
                icon: '🎯',
                description: 'Define what\'s most important',
                type: 'planning',
                isPredefined: true,
                navigateTarget: { type: 'action', mode: 'create' }
            },
            {
                title: 'Check Calendar',
                icon: '📅',
                description: 'Review upcoming appointments',
                type: 'planning',
                isPredefined: true
            },
            {
                title: 'Plan Tomorrow',
                icon: '🌅',
                description: 'Prepare for the next day',
                type: 'planning',
                isPredefined: true
            },
            {
                title: 'Review Goals',
                icon: '🏆',
                description: 'Check progress on your objectives',
                type: 'planning',
                isPredefined: true
            },

            // Review category - with navigation targets
            {
                title: 'Review Sparks',
                icon: '💡',
                description: 'Look through your ideas and insights',
                type: 'review',
                isPredefined: true,
                navigateTarget: { type: 'spark', mode: 'review' }
            },
            {
                title: 'Path Progress Check',
                icon: '🛤️',
                description: 'Review your long-term progress',
                type: 'review',
                isPredefined: true,
                navigateTarget: { type: 'path', mode: 'view' }
            },
            {
                title: 'Weekly Reflection',
                icon: '🔍',
                description: 'Think about the past week',
                type: 'review',
                isPredefined: true
            },
            {
                title: 'Journal',
                icon: '📔',
                description: 'Write in your journal',
                type: 'review',
                isPredefined: true
            },
        ];

        for (const template of predefinedTemplates) {
            try {
                await createActivityTemplate(template);
            } catch (error) {
                console.error(`Failed to create template ${template.title}:`, error);
            }
        }

        if (DEBUG_LOG) console.log('Initialized predefined activity templates with enhanced structure');
    } catch (error) {
        console.error('Error initializing predefined activity templates:', error);
    }
};

// Function to get active loop execution (if any)
export const getActiveLoopExecution = async (): Promise<{ loop: Loop; executionState: LoopExecutionState } | null> => {
    try {
        const result = await executeSql(
            'SELECT * FROM loops WHERE isExecuting = 1 LIMIT 1',
            []
        );

        if (result && result.rows && result.rows._array && result.rows._array.length > 0) {
            const loopData = result.rows._array[0];
            const loop = {
                ...loopData,
                type: 'loop',
                tags: loopData.tags ? JSON.parse(loopData.tags) : [],
                startTimeByDay: loopData.startTimeByDay ? JSON.parse(loopData.startTimeByDay) : undefined,
                active: Boolean(loopData.active),
                isStarred: Boolean(loopData.starred),
                currentActivityIndex: loopData.currentActivityIndex || 0,
                isExecuting: Boolean(loopData.isExecuting),
                lastExecutionDate: loopData.lastExecutionDate,
            } as Loop;

            // Fetch activity instances
            loop.activityInstances = await getLoopActivityInstances(loop.id);

            // Legacy support: Fetch activities
            loop.activities = await getLoopActivities(loop.id);

            // Fetch execution state
            const executionState = await getLoopExecutionState(loop.id);

            if (executionState) {
                return { loop, executionState };
            }
        }

        return null;
    } catch (error) {
        console.error("Error getting active loop execution:", error);
        return null;
    }
};