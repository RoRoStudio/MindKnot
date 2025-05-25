// src/store/index.ts
export { store } from './shared/store';
export type { RootState, AppDispatch } from './shared/store';
export { useAppDispatch, useAppSelector } from './shared';

// Export all entity-specific actions and hooks
export * from './actions';
export * from './notes';
export * from './sparks';

// Re-export all loop-related functionality
export {
    loopReducer,
    useLoopActions,
    // Async thunks
    fetchLoops,
    addLoop,
    updateLoopThunk,
    removeLoop,
    fetchActivityTemplates,
    addActivityTemplate,
    updateActivityTemplateThunk,
    removeActivityTemplate,
    initializePredefinedTemplates,
    startLoopExecutionThunk,
    completeLoopExecutionThunk,
    // Enhanced actions
    loadActiveExecution,
    navigateToActivity,
    advanceActivity,
    pauseLoopExecution,
    updateActivityTimer,
    syncActivityTimer,
    clearActivityTimers,
    // Regular actions
    setDraft,
    resetDraft,
    updateDraft,
    setCurrentLoop,
    clearError,
    setError
} from './loops';

// Re-export specific items from paths
import {
    usePathDraft
} from './paths';

export {
    usePathDraft
};

export * from './sagas'; 