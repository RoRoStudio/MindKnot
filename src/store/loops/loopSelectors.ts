import { RootState } from '../../store/shared/store';
import { createSelector } from '@reduxjs/toolkit';
import { Loop, ActivityTemplate, LoopExecutionState, LoopActivityInstance } from '../../types/loop';

// Basic selectors
export const selectLoops = (state: RootState) => state.loop.loops;
export const selectCurrentLoop = (state: RootState) => state.loop.currentLoop;
export const selectLoopDraft = (state: RootState) => state.loop.draft;
export const selectLoopLoading = (state: RootState) => state.loop.loading;
export const selectLoopError = (state: RootState) => state.loop.error;

// Activity template selectors
export const selectActivityTemplates = (state: RootState) => state.loop.activityTemplates;
export const selectPredefinedActivityTemplates = (state: RootState) =>
    state.loop.activityTemplates.filter(template => template.isPredefined);
export const selectCustomActivityTemplates = (state: RootState) =>
    state.loop.activityTemplates.filter(template => !template.isPredefined);

// Activity templates by category - memoized to prevent unnecessary re-renders
export const selectActivityTemplatesByCategory = createSelector(
    [selectActivityTemplates],
    (templates) => {
        const categories = {
            mind: templates.filter(t => t.type === 'mind'),
            body: templates.filter(t => t.type === 'body'),
            planning: templates.filter(t => t.type === 'planning'),
            review: templates.filter(t => t.type === 'review'),
            custom: templates.filter(t => t.type === 'custom' || !t.type)
        };

        return categories;
    }
);

// Execution selectors
export const selectActiveExecution = (state: RootState) => state.loop.activeExecution;
export const selectIsAnyLoopExecuting = (state: RootState) => state.loop.activeExecution !== null;
export const selectExecutingLoop = (state: RootState) => state.loop.activeExecution?.loop || null;
export const selectExecutionState = (state: RootState) => state.loop.activeExecution?.executionState || null;

// Helper selectors
export const selectLoopById = (id: string) => (state: RootState) =>
    state.loop.loops.find(loop => loop.id === id);

export const selectActivityTemplateById = (id: string) => (state: RootState) =>
    state.loop.activityTemplates.find(template => template.id === id);

// Loop filtering selectors
export const selectActiveLoops = (state: RootState) =>
    state.loop.loops.filter(loop => loop.active !== false);

export const selectStarredLoops = (state: RootState) =>
    state.loop.loops.filter(loop => loop.isStarred);

export const selectRecentLoops = (state: RootState) =>
    state.loop.loops
        .filter(loop => loop.lastExecutionDate)
        .sort((a, b) => new Date(b.lastExecutionDate!).getTime() - new Date(a.lastExecutionDate!).getTime())
        .slice(0, 5);

// Activity-based loop selectors - updated for new structure
export const selectLoopsWithActivityInstances = (state: RootState) =>
    state.loop.loops.filter(loop => loop.activityInstances && loop.activityInstances.length > 0);

// Legacy support
export const selectLoopsWithActivities = (state: RootState) =>
    state.loop.loops.filter(loop => loop.activities && loop.activities.length > 0);

export const selectLegacyLoops = (state: RootState) =>
    state.loop.loops.filter(loop => loop.items && loop.items.length > 0 && (!loop.activities || loop.activities.length === 0));

// Execution progress selectors - updated for new structure
export const selectCurrentActivityProgress = (state: RootState) => {
    const execution = state.loop.activeExecution;
    if (!execution) return null;

    // Use new activityInstances structure primarily, fall back to legacy activities
    const activityInstances = execution.loop.activityInstances;
    const legacyActivities = execution.loop.activities;

    const totalActivities = activityInstances?.length || legacyActivities?.length || 0;
    const currentIndex = execution.executionState.currentActivityIndex;
    const completedCount = execution.executionState.completedActivities.length;

    return {
        currentIndex,
        totalActivities,
        completedCount,
        progress: totalActivities > 0 ? (currentIndex / totalActivities) * 100 : 0,
        isComplete: currentIndex >= totalActivities
    };
};

// Current activity selectors - updated for new structure
export const selectCurrentActivityInstance = (state: RootState): LoopActivityInstance | null => {
    const execution = state.loop.activeExecution;
    if (!execution) return null;

    const currentIndex = execution.executionState.currentActivityIndex;
    const activityInstances = execution.loop.activityInstances;

    if (!activityInstances || currentIndex >= activityInstances.length) return null;

    return activityInstances[currentIndex];
};

// Legacy support - keep old selector for backward compatibility
export const selectCurrentActivity = (state: RootState) => {
    const execution = state.loop.activeExecution;
    if (!execution || !execution.loop.activities) return null;

    const currentIndex = execution.executionState.currentActivityIndex;
    const activities = execution.loop.activities;

    if (currentIndex >= activities.length) return null;

    return activities[currentIndex];
};

// Updated selector for new structure
export const selectCurrentActivityWithTemplate = (state: RootState) => {
    const currentActivityInstance = selectCurrentActivityInstance(state);
    if (!currentActivityInstance) {
        // Fall back to legacy structure
        const currentActivity = selectCurrentActivity(state);
        if (!currentActivity) return null;

        const template = selectActivityTemplateById(currentActivity.baseActivityId)(state);
        return {
            activity: currentActivity,
            template
        };
    }

    const template = selectActivityTemplateById(currentActivityInstance.templateId)(state);
    if (!template) return null;

    return {
        activity: currentActivityInstance,
        template
    };
};

// Get next activity instance
export const selectNextActivityInstance = (state: RootState): LoopActivityInstance | null => {
    const execution = state.loop.activeExecution;
    if (!execution) return null;

    const currentIndex = execution.executionState.currentActivityIndex;
    const activityInstances = execution.loop.activityInstances;

    if (!activityInstances || currentIndex + 1 >= activityInstances.length) return null;

    return activityInstances[currentIndex + 1];
};

// Get all activity instances with their templates for a loop
export const selectLoopActivityInstancesWithTemplates = (loopId: string) => (state: RootState) => {
    const loop = selectLoopById(loopId)(state);
    if (!loop || !loop.activityInstances) return [];

    return loop.activityInstances.map(instance => {
        const template = selectActivityTemplateById(instance.templateId)(state);
        return {
            instance,
            template
        };
    }).filter(item => item.template !== undefined);
}; 