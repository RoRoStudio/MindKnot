import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../shared';
import {
    Loop,
    ActivityTemplate,
    LoopActivity,
    LoopActivityInstance,
    LoopExecutionState,
    ActivityExecutionResult
} from '../../types/loop';
import {
    // Loop operations
    fetchLoops,
    addLoop,
    updateLoopThunk,
    removeLoop,

    // Activity template operations
    fetchActivityTemplates,
    addActivityTemplate,
    updateActivityTemplateThunk,
    removeActivityTemplate,
    initializePredefinedTemplates,

    // Execution operations
    startLoopExecutionThunk,
    completeLoopExecutionThunk,
    pauseLoopExecutionThunk,
    advanceLoopActivityThunk,
    fetchActiveExecution,
    navigateToActivityThunk,

    // Actions
    setDraft,
    resetDraft,
    updateDraft,
    setCurrentLoop,
    clearError,
    setError
} from './loopSlice';

import {
    selectLoops,
    selectCurrentLoop,
    selectLoopDraft,
    selectLoopLoading,
    selectLoopError,
    selectActivityTemplates,
    selectActivityTemplatesByCategory,
    selectActiveExecution,
    selectIsAnyLoopExecuting,
    selectCurrentActivityWithTemplate,
    selectCurrentActivityProgress,
    selectCurrentActivityInstance,
    selectNextActivityInstance,
    selectLoopById,
    selectActivityTemplateById,
    selectLoopActivityInstancesWithTemplates
} from './loopSelectors';

import {
    createLoopActivity,
    updateLoopActivity,
    deleteLoopActivity,
    reorderLoopActivities,
    createLoopActivityInstance,
    updateLoopActivityInstance,
    deleteLoopActivityInstance,
    reorderLoopActivityInstances,
    getActivityTemplateById as getActivityTemplateByIdAPI,
    getLoopById as getLoopByIdAPI
} from '../../api/loopService';

export const useLoopActions = () => {
    const dispatch = useAppDispatch();

    // Selectors
    const loops = useAppSelector(selectLoops);
    const currentLoop = useAppSelector(selectCurrentLoop);
    const draft = useAppSelector(selectLoopDraft);
    const loading = useAppSelector(selectLoopLoading);
    const error = useAppSelector(selectLoopError);
    const activityTemplates = useAppSelector(selectActivityTemplates);
    const activityTemplatesByCategory = useAppSelector(selectActivityTemplatesByCategory);
    const activeExecution = useAppSelector(selectActiveExecution);
    const isAnyLoopExecuting = useAppSelector(selectIsAnyLoopExecuting);
    const currentActivityWithTemplate = useAppSelector(selectCurrentActivityWithTemplate);
    const currentActivityProgress = useAppSelector(selectCurrentActivityProgress);
    const currentActivityInstance = useAppSelector(selectCurrentActivityInstance);
    const nextActivityInstance = useAppSelector(selectNextActivityInstance);

    // =====================
    // LOOP OPERATIONS
    // =====================

    const loadLoops = useCallback(async () => {
        const resultAction = await dispatch(fetchLoops());
        return fetchLoops.fulfilled.match(resultAction);
    }, [dispatch]);

    const createLoop = useCallback(async (loop: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) => {
        const resultAction = await dispatch(addLoop(loop));
        return addLoop.fulfilled.match(resultAction);
    }, [dispatch]);

    const updateLoop = useCallback(async (id: string, updates: Partial<Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const resultAction = await dispatch(updateLoopThunk({ id, updates }));
        return updateLoopThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const deleteLoop = useCallback(async (id: string) => {
        const resultAction = await dispatch(removeLoop(id));
        return removeLoop.fulfilled.match(resultAction);
    }, [dispatch]);

    const getLoopById = useCallback(async (id: string) => {
        try {
            return await getLoopByIdAPI(id);
        } catch (error) {
            console.error('Error getting loop by id:', error);
            return null;
        }
    }, []);

    // =====================
    // ACTIVITY TEMPLATE OPERATIONS
    // =====================

    const loadActivityTemplates = useCallback(async () => {
        const resultAction = await dispatch(fetchActivityTemplates());
        return fetchActivityTemplates.fulfilled.match(resultAction);
    }, [dispatch]);

    const createActivityTemplate = useCallback(async (template: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
        const resultAction = await dispatch(addActivityTemplate(template));
        return addActivityTemplate.fulfilled.match(resultAction);
    }, [dispatch]);

    const updateActivityTemplate = useCallback(async (id: string, updates: Partial<Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
        const resultAction = await dispatch(updateActivityTemplateThunk({ id, updates }));
        return updateActivityTemplateThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const deleteActivityTemplate = useCallback(async (id: string) => {
        const resultAction = await dispatch(removeActivityTemplate(id));
        return removeActivityTemplate.fulfilled.match(resultAction);
    }, [dispatch]);

    const getActivityTemplateById = useCallback(async (id: string) => {
        try {
            return await getActivityTemplateByIdAPI(id);
        } catch (error) {
            console.error('Error getting activity template by id:', error);
            return null;
        }
    }, []);

    const getActivityTemplatesByIds = useCallback(async (ids: string[]) => {
        try {
            const templates = await Promise.all(
                ids.map(id => getActivityTemplateByIdAPI(id))
            );
            return templates.filter(template => template !== null) as ActivityTemplate[];
        } catch (error) {
            console.error('Error getting activity templates by ids:', error);
            return [];
        }
    }, []);

    const initializePredefinedActivityTemplates = useCallback(async () => {
        const resultAction = await dispatch(initializePredefinedTemplates());
        return initializePredefinedTemplates.fulfilled.match(resultAction);
    }, [dispatch]);

    // =====================
    // LOOP ACTIVITY INSTANCE OPERATIONS (NEW)
    // =====================

    const addLoopActivityInstance = useCallback(async (loopId: string, instance: Omit<LoopActivityInstance, 'id'>) => {
        try {
            await createLoopActivityInstance(loopId, instance);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error adding loop activity instance:', error);
            return false;
        }
    }, [dispatch]);

    const editLoopActivityInstance = useCallback(async (instanceId: string, updates: Partial<Omit<LoopActivityInstance, 'id'>>) => {
        try {
            await updateLoopActivityInstance(instanceId, updates);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error updating loop activity instance:', error);
            return false;
        }
    }, [dispatch]);

    const removeLoopActivityInstance = useCallback(async (instanceId: string) => {
        try {
            await deleteLoopActivityInstance(instanceId);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error deleting loop activity instance:', error);
            return false;
        }
    }, [dispatch]);

    const reorderActivityInstances = useCallback(async (loopId: string, instanceOrders: { id: string; order: number }[]) => {
        try {
            await reorderLoopActivityInstances(loopId, instanceOrders);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error reordering loop activity instances:', error);
            return false;
        }
    }, [dispatch]);

    // Get activity instances with templates for a specific loop
    const getLoopActivityInstancesWithTemplates = useCallback((loopId: string) => {
        return useAppSelector(selectLoopActivityInstancesWithTemplates(loopId));
    }, []);

    // =====================
    // LOOP ACTIVITY OPERATIONS (LEGACY)
    // =====================

    const addLoopActivity = useCallback(async (loopId: string, activity: Omit<LoopActivity, 'id'>) => {
        try {
            await createLoopActivity(loopId, activity);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error adding loop activity:', error);
            return false;
        }
    }, [dispatch]);

    const editLoopActivity = useCallback(async (activityId: string, updates: Partial<Omit<LoopActivity, 'id'>>) => {
        try {
            await updateLoopActivity(activityId, updates);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error updating loop activity:', error);
            return false;
        }
    }, [dispatch]);

    const removeLoopActivity = useCallback(async (activityId: string) => {
        try {
            await deleteLoopActivity(activityId);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error deleting loop activity:', error);
            return false;
        }
    }, [dispatch]);

    const reorderActivities = useCallback(async (loopId: string, activityOrders: { id: string; order: number }[]) => {
        try {
            await reorderLoopActivities(loopId, activityOrders);
            // Refresh the loop data
            await dispatch(fetchLoops());
            return true;
        } catch (error) {
            console.error('Error reordering loop activities:', error);
            return false;
        }
    }, [dispatch]);

    // =====================
    // LOOP EXECUTION OPERATIONS
    // =====================

    const startLoopExecution = useCallback(async (loopId: string) => {
        const resultAction = await dispatch(startLoopExecutionThunk(loopId));
        return startLoopExecutionThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const completeLoopExecution = useCallback(async (loopId: string) => {
        const resultAction = await dispatch(completeLoopExecutionThunk(loopId));
        return completeLoopExecutionThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const pauseLoopExecution = useCallback(async (loopId: string, isPaused: boolean) => {
        const resultAction = await dispatch(pauseLoopExecutionThunk({ loopId, isPaused }));
        return pauseLoopExecutionThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const advanceActivity = useCallback(async (loopId: string, activityResult: ActivityExecutionResult) => {
        const resultAction = await dispatch(advanceLoopActivityThunk({ loopId, activityResult }));
        return advanceLoopActivityThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const navigateToActivity = useCallback(async (loopId: string, targetIndex: number) => {
        const resultAction = await dispatch(navigateToActivityThunk({ loopId, targetIndex }));
        return navigateToActivityThunk.fulfilled.match(resultAction);
    }, [dispatch]);

    const loadActiveExecution = useCallback(async () => {
        const resultAction = await dispatch(fetchActiveExecution());
        return fetchActiveExecution.fulfilled.match(resultAction);
    }, [dispatch]);

    // =====================
    // DRAFT MANAGEMENT
    // =====================

    const setLoopDraft = useCallback((draft: Partial<Loop> | null) => {
        dispatch(setDraft(draft));
    }, [dispatch]);

    const resetLoopDraft = useCallback(() => {
        dispatch(resetDraft());
    }, [dispatch]);

    const updateLoopDraft = useCallback((updates: Partial<Loop>) => {
        dispatch(updateDraft(updates));
    }, [dispatch]);

    // =====================
    // CURRENT LOOP MANAGEMENT
    // =====================

    const setCurrentLoopState = useCallback((loop: Loop | null) => {
        dispatch(setCurrentLoop(loop));
    }, [dispatch]);

    // =====================
    // ERROR MANAGEMENT
    // =====================

    const clearLoopError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const setLoopError = useCallback((error: string) => {
        dispatch(setError(error));
    }, [dispatch]);

    // =====================
    // CONVENIENCE METHODS
    // =====================

    const checkForActiveExecution = useCallback(async () => {
        await loadActiveExecution();
        return activeExecution !== null;
    }, [loadActiveExecution, activeExecution]);

    const hasUnfinishedLoop = useCallback(() => {
        return isAnyLoopExecuting;
    }, [isAnyLoopExecuting]);

    const getCurrentActivityInfo = useCallback(() => {
        return currentActivityWithTemplate;
    }, [currentActivityWithTemplate]);

    const getExecutionProgress = useCallback(() => {
        return currentActivityProgress;
    }, [currentActivityProgress]);

    const getCurrentActivityInstance = useCallback(() => {
        return currentActivityInstance;
    }, [currentActivityInstance]);

    const getNextActivityInstance = useCallback(() => {
        return nextActivityInstance;
    }, [nextActivityInstance]);

    // =====================
    // RETURN OBJECT
    // =====================

    return {
        // State
        loops,
        currentLoop,
        draft,
        loading,
        error,
        activityTemplates,
        activityTemplatesByCategory,
        activeExecution,
        isAnyLoopExecuting,
        currentActivityWithTemplate,
        currentActivityProgress,
        currentActivityInstance,
        nextActivityInstance,

        // Loop operations
        loadLoops,
        createLoop,
        updateLoop,
        deleteLoop,
        getLoopById,

        // Activity template operations
        loadActivityTemplates,
        createActivityTemplate,
        updateActivityTemplate,
        deleteActivityTemplate,
        getActivityTemplateById,
        getActivityTemplatesByIds,
        initializePredefinedActivityTemplates,

        // Activity instance operations (NEW)
        addLoopActivityInstance,
        editLoopActivityInstance,
        removeLoopActivityInstance,
        reorderActivityInstances,
        getLoopActivityInstancesWithTemplates,

        // Loop activity operations (LEGACY)
        addLoopActivity,
        editLoopActivity,
        removeLoopActivity,
        reorderActivities,

        // Execution operations
        startLoopExecution,
        completeLoopExecution,
        pauseLoopExecution,
        advanceActivity,
        navigateToActivity,
        loadActiveExecution,

        // Draft management
        setLoopDraft,
        resetLoopDraft,
        updateLoopDraft,

        // Current loop management
        setCurrentLoopState,

        // Error management
        clearLoopError,
        setLoopError,

        // Convenience methods
        checkForActiveExecution,
        hasUnfinishedLoop,
        getCurrentActivityInfo,
        getExecutionProgress,
        getCurrentActivityInstance,
        getNextActivityInstance,
    };
};

// Maintain backward compatibility
export const useLoopDraft = useLoopActions; 