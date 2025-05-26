import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store/store';
import {
    // Loop actions
    fetchLoops,
    createLoop,
    updateLoop,
    deleteLoop,
    duplicateLoop,
    setSelectedLoop,
    setLoopFilters,
    clearLoopFilters,
    setLoopSorting,
    loadMoreLoops,
    refreshLoops,
    toggleLoopFavorite,
    clearLoopError,
    resetLoopState,

    // Execution actions
    startExecution,
    pauseExecution,
    resumeExecution,
    stopExecution,
    skipActivity,
    previousActivity,
    updateActivityProgress,
    completeActivity,
    completeExecution,
    cancelExecution,
    enterBackground,
    exitBackground,
    saveExecutionState,
    recoverExecution,
    clearRecoveryData,
    addExecutionToHistory,
    clearExecutionHistory,
    clearExecutionError,
    resetExecutionState,

    // Template actions
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setSelectedTemplate,
    setTemplateFilters,
    clearTemplateFilters,
    clearTemplateError,
    resetTemplateState,

    // Builder actions
    initializeDraftLoop,
    updateDraftLoop,
    clearDraftLoop,
    setCurrentStep,
    nextStep,
    previousStep,
    addActivity,
    updateActivity,
    removeActivity,
    reorderActivities,
    duplicateActivity,
    openActivityBuilder,
    closeActivityBuilder,
    setSelectedTemplateInBuilder,
    startDragging,
    setDropTarget,
    endDragging,
    cancelDragging,
    setValidationErrors,
    clearValidationErrors,
    validateDraftLoop,
    setPreviewMode,
    markSaved,
    resetBuilderState,

    // Selectors
    selectSortedLoops,
    selectSelectedLoop,
    selectLoopFilters,
    selectLoopLoading,
    selectLoopError,
    selectLoopStats,
    selectRecentLoops,
    selectFavoriteLoops,
    selectLoopCategories,
    selectLoopTags,
    selectHasLoops,
    selectHasFilters,
    selectCanLoadMore,
    selectLoadingState,

    // Execution selectors
    selectCurrentExecution,
    selectExecutionHistory,
    selectIsExecuting,
    selectIsPaused,
    selectExecutionStatus,
    selectCurrentActivity,
    selectExecutionProgress,
    selectExecutionTiming,
    selectCanPause,
    selectCanResume,
    selectCanStop,
    selectCanSkip,
    selectCanGoBack,
    selectExecutionStats,
    selectIsInBackground,
    selectHasRecoverableExecution,
    selectExecutionSummary,

    // Template selectors
    selectFilteredTemplates,
    selectSelectedTemplate,
    selectTemplateFilters,
    selectTemplateLoading,
    selectTemplateError,
    selectBuiltInTemplates,
    selectCustomTemplates,
    selectTemplatesByType,
    selectTemplateCategories,
    selectTemplateTypes,
    selectTemplateStats,
    selectHasTemplates,
    selectHasCustomTemplates,

    // Builder selectors
    selectDraftLoop,
    selectIsEditing,
    selectCurrentStep,
    selectHasUnsavedChanges,
    selectValidationErrors,
    selectDraftActivities,
    selectDraftLoopStats,
    selectIsValidDraftLoop,
    selectCanSaveDraftLoop,
    selectStepProgress,
    selectOverallProgress,
    selectIsActivityBuilderOpen,
    selectEditingActivity,
    selectIsDragging,
    selectCanGoToNextStep,
    selectCanGoToPreviousStep,
    selectBuilderSummary,
} from '../store';
import { Loop, Activity, ActivityTemplate } from '../../../shared/types/loop';

// Loop hooks
export const useLoops = () => {
    const dispatch = useDispatch<AppDispatch>();

    const loops = useSelector(selectSortedLoops);
    const selectedLoop = useSelector(selectSelectedLoop);
    const filters = useSelector(selectLoopFilters);
    const isLoading = useSelector(selectLoopLoading);
    const error = useSelector(selectLoopError);
    const stats = useSelector(selectLoopStats);
    const recentLoops = useSelector(selectRecentLoops);
    const favoriteLoops = useSelector(selectFavoriteLoops);
    const categories = useSelector(selectLoopCategories);
    const tags = useSelector(selectLoopTags);
    const hasLoops = useSelector(selectHasLoops);
    const hasFilters = useSelector(selectHasFilters);
    const canLoadMore = useSelector(selectCanLoadMore);
    const loadingState = useSelector(selectLoadingState);

    const actions = {
        fetchLoops: useCallback((filters?: any) => dispatch(fetchLoops(filters)), [dispatch]),
        createLoop: useCallback((loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'>) =>
            dispatch(createLoop(loopData)), [dispatch]),
        updateLoop: useCallback((updates: { id: string; updates: Partial<Loop> }) =>
            dispatch(updateLoop(updates)), [dispatch]),
        deleteLoop: useCallback((id: string) => dispatch(deleteLoop(id)), [dispatch]),
        duplicateLoop: useCallback((id: string) => dispatch(duplicateLoop(id)), [dispatch]),
        setSelectedLoop: useCallback((loop: Loop | null) => dispatch(setSelectedLoop(loop)), [dispatch]),
        setFilters: useCallback((filters: any) => dispatch(setLoopFilters(filters)), [dispatch]),
        clearFilters: useCallback(() => dispatch(clearLoopFilters()), [dispatch]),
        setSorting: useCallback((sorting: any) => dispatch(setLoopSorting(sorting)), [dispatch]),
        loadMore: useCallback(() => dispatch(loadMoreLoops()), [dispatch]),
        refresh: useCallback(() => dispatch(refreshLoops()), [dispatch]),
        toggleFavorite: useCallback((id: string) => dispatch(toggleLoopFavorite(id)), [dispatch]),
        clearError: useCallback(() => dispatch(clearLoopError()), [dispatch]),
        reset: useCallback(() => dispatch(resetLoopState()), [dispatch]),
    };

    return {
        loops,
        selectedLoop,
        filters,
        isLoading,
        error,
        stats,
        recentLoops,
        favoriteLoops,
        categories,
        tags,
        hasLoops,
        hasFilters,
        canLoadMore,
        loadingState,
        ...actions,
    };
};

// Execution hooks
export const useExecution = () => {
    const dispatch = useDispatch<AppDispatch>();

    const currentExecution = useSelector(selectCurrentExecution);
    const executionHistory = useSelector(selectExecutionHistory);
    const isExecuting = useSelector(selectIsExecuting);
    const isPaused = useSelector(selectIsPaused);
    const status = useSelector(selectExecutionStatus);
    const currentActivity = useSelector(selectCurrentActivity);
    const progress = useSelector(selectExecutionProgress);
    const timing = useSelector(selectExecutionTiming);
    const canPause = useSelector(selectCanPause);
    const canResume = useSelector(selectCanResume);
    const canStop = useSelector(selectCanStop);
    const canSkip = useSelector(selectCanSkip);
    const canGoBack = useSelector(selectCanGoBack);
    const stats = useSelector(selectExecutionStats);
    const isInBackground = useSelector(selectIsInBackground);
    const hasRecoverableExecution = useSelector(selectHasRecoverableExecution);
    const summary = useSelector(selectExecutionSummary);

    const actions = {
        start: useCallback((loop: Loop) => dispatch(startExecution(loop)), [dispatch]),
        pause: useCallback(() => dispatch(pauseExecution()), [dispatch]),
        resume: useCallback(() => dispatch(resumeExecution()), [dispatch]),
        stop: useCallback(() => dispatch(stopExecution()), [dispatch]),
        skip: useCallback(() => dispatch(skipActivity()), [dispatch]),
        previous: useCallback(() => dispatch(previousActivity()), [dispatch]),
        updateProgress: useCallback((progress: number) => dispatch(updateActivityProgress(progress)), [dispatch]),
        completeActivity: useCallback(() => dispatch(completeActivity()), [dispatch]),
        complete: useCallback(() => dispatch(completeExecution()), [dispatch]),
        cancel: useCallback(() => dispatch(cancelExecution()), [dispatch]),
        enterBackground: useCallback(() => dispatch(enterBackground()), [dispatch]),
        exitBackground: useCallback(() => dispatch(exitBackground()), [dispatch]),
        saveState: useCallback(() => dispatch(saveExecutionState()), [dispatch]),
        recover: useCallback(() => dispatch(recoverExecution()), [dispatch]),
        clearRecovery: useCallback(() => dispatch(clearRecoveryData()), [dispatch]),
        addToHistory: useCallback((execution: any) => dispatch(addExecutionToHistory(execution)), [dispatch]),
        clearHistory: useCallback(() => dispatch(clearExecutionHistory()), [dispatch]),
        clearError: useCallback(() => dispatch(clearExecutionError()), [dispatch]),
        reset: useCallback(() => dispatch(resetExecutionState()), [dispatch]),
    };

    return {
        currentExecution,
        executionHistory,
        isExecuting,
        isPaused,
        status,
        currentActivity,
        progress,
        timing,
        canPause,
        canResume,
        canStop,
        canSkip,
        canGoBack,
        stats,
        isInBackground,
        hasRecoverableExecution,
        summary,
        ...actions,
    };
};

// Template hooks
export const useTemplates = () => {
    const dispatch = useDispatch<AppDispatch>();

    const templates = useSelector(selectFilteredTemplates);
    const selectedTemplate = useSelector(selectSelectedTemplate);
    const filters = useSelector(selectTemplateFilters);
    const isLoading = useSelector(selectTemplateLoading);
    const error = useSelector(selectTemplateError);
    const builtInTemplates = useSelector(selectBuiltInTemplates);
    const customTemplates = useSelector(selectCustomTemplates);
    const templatesByType = useSelector(selectTemplatesByType);
    const categories = useSelector(selectTemplateCategories);
    const types = useSelector(selectTemplateTypes);
    const stats = useSelector(selectTemplateStats);
    const hasTemplates = useSelector(selectHasTemplates);
    const hasCustomTemplates = useSelector(selectHasCustomTemplates);

    const actions = {
        fetch: useCallback((filters?: any) => dispatch(fetchTemplates(filters)), [dispatch]),
        create: useCallback((templateData: Omit<ActivityTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) =>
            dispatch(createTemplate(templateData)), [dispatch]),
        update: useCallback((updates: { id: string; updates: Partial<ActivityTemplate> }) =>
            dispatch(updateTemplate(updates)), [dispatch]),
        delete: useCallback((id: string) => dispatch(deleteTemplate(id)), [dispatch]),
        duplicate: useCallback((id: string) => dispatch(duplicateTemplate(id)), [dispatch]),
        setSelected: useCallback((template: ActivityTemplate | null) =>
            dispatch(setSelectedTemplate(template)), [dispatch]),
        setFilters: useCallback((filters: any) => dispatch(setTemplateFilters(filters)), [dispatch]),
        clearFilters: useCallback(() => dispatch(clearTemplateFilters()), [dispatch]),
        clearError: useCallback(() => dispatch(clearTemplateError()), [dispatch]),
        reset: useCallback(() => dispatch(resetTemplateState()), [dispatch]),
    };

    return {
        templates,
        selectedTemplate,
        filters,
        isLoading,
        error,
        builtInTemplates,
        customTemplates,
        templatesByType,
        categories,
        types,
        stats,
        hasTemplates,
        hasCustomTemplates,
        ...actions,
    };
};

// Builder hooks
export const useLoopBuilder = () => {
    const dispatch = useDispatch<AppDispatch>();

    const draftLoop = useSelector(selectDraftLoop);
    const isEditing = useSelector(selectIsEditing);
    const currentStep = useSelector(selectCurrentStep);
    const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
    const validationErrors = useSelector(selectValidationErrors);
    const activities = useSelector(selectDraftActivities);
    const stats = useSelector(selectDraftLoopStats);
    const isValid = useSelector(selectIsValidDraftLoop);
    const canSave = useSelector(selectCanSaveDraftLoop);
    const stepProgress = useSelector(selectStepProgress);
    const overallProgress = useSelector(selectOverallProgress);
    const isActivityBuilderOpen = useSelector(selectIsActivityBuilderOpen);
    const editingActivity = useSelector(selectEditingActivity);
    const isDragging = useSelector(selectIsDragging);
    const canGoToNext = useSelector(selectCanGoToNextStep);
    const canGoToPrevious = useSelector(selectCanGoToPreviousStep);
    const summary = useSelector(selectBuilderSummary);

    const actions = {
        initialize: useCallback((options: { loop?: Loop; isEditing?: boolean }) =>
            dispatch(initializeDraftLoop(options)), [dispatch]),
        update: useCallback((updates: Partial<Loop>) => dispatch(updateDraftLoop(updates)), [dispatch]),
        clear: useCallback(() => dispatch(clearDraftLoop()), [dispatch]),
        setStep: useCallback((step: any) => dispatch(setCurrentStep(step)), [dispatch]),
        nextStep: useCallback(() => dispatch(nextStep()), [dispatch]),
        previousStep: useCallback(() => dispatch(previousStep()), [dispatch]),
        addActivity: useCallback((activity: Activity) => dispatch(addActivity(activity)), [dispatch]),
        updateActivity: useCallback((data: { index: number; activity: Activity }) =>
            dispatch(updateActivity(data)), [dispatch]),
        removeActivity: useCallback((index: number) => dispatch(removeActivity(index)), [dispatch]),
        reorderActivities: useCallback((data: { fromIndex: number; toIndex: number }) =>
            dispatch(reorderActivities(data)), [dispatch]),
        duplicateActivity: useCallback((index: number) => dispatch(duplicateActivity(index)), [dispatch]),
        openActivityBuilder: useCallback((options: any) => dispatch(openActivityBuilder(options)), [dispatch]),
        closeActivityBuilder: useCallback(() => dispatch(closeActivityBuilder()), [dispatch]),
        setSelectedTemplate: useCallback((template: ActivityTemplate | null) =>
            dispatch(setSelectedTemplateInBuilder(template)), [dispatch]),
        startDragging: useCallback((index: number) => dispatch(startDragging(index)), [dispatch]),
        setDropTarget: useCallback((index: number | null) => dispatch(setDropTarget(index)), [dispatch]),
        endDragging: useCallback(() => dispatch(endDragging()), [dispatch]),
        cancelDragging: useCallback(() => dispatch(cancelDragging()), [dispatch]),
        setValidationErrors: useCallback((errors: any) => dispatch(setValidationErrors(errors)), [dispatch]),
        clearValidationErrors: useCallback(() => dispatch(clearValidationErrors()), [dispatch]),
        validate: useCallback(() => dispatch(validateDraftLoop()), [dispatch]),
        setPreviewMode: useCallback((mode: any) => dispatch(setPreviewMode(mode)), [dispatch]),
        markSaved: useCallback(() => dispatch(markSaved()), [dispatch]),
        reset: useCallback(() => dispatch(resetBuilderState()), [dispatch]),
    };

    return {
        draftLoop,
        isEditing,
        currentStep,
        hasUnsavedChanges,
        validationErrors,
        activities,
        stats,
        isValid,
        canSave,
        stepProgress,
        overallProgress,
        isActivityBuilderOpen,
        editingActivity,
        isDragging,
        canGoToNext,
        canGoToPrevious,
        summary,
        ...actions,
    };
};

// Combined hook for full loop functionality
export const useLoopStore = () => {
    const loops = useLoops();
    const execution = useExecution();
    const templates = useTemplates();
    const builder = useLoopBuilder();

    return {
        loops,
        execution,
        templates,
        builder,
    };
};

// Utility hooks for specific use cases
export const useLoopById = (id: string) => {
    return useSelector((state: RootState) =>
        state.loops.loops.find(loop => loop.id === id) || null
    );
};

export const useTemplateById = (id: string) => {
    return useSelector((state: RootState) =>
        state.templates.templates.find(template => template.id === id) || null
    );
};

export const useExecutionHistoryForLoop = (loopId: string) => {
    return useSelector((state: RootState) =>
        state.execution.executionHistory.filter(execution => execution.loopId === loopId)
    );
};

export const useIsLoopExecuting = (loopId: string) => {
    return useSelector((state: RootState) =>
        state.execution.currentExecution?.loop.id === loopId && state.execution.isExecuting
    );
}; 