import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Loop, Activity, ActivityTemplate } from '../../../shared/types/loop';

export interface BuilderState {
    draftLoop: Partial<Loop> | null;
    isEditing: boolean;
    editingLoopId: string | null;
    currentStep: 'details' | 'activities' | 'settings' | 'preview';
    hasUnsavedChanges: boolean;
    validationErrors: {
        title?: string;
        activities?: string;
        general?: string;
    };
    dragAndDrop: {
        isDragging: boolean;
        draggedActivityIndex: number | null;
        dropTargetIndex: number | null;
    };
    activityBuilder: {
        isOpen: boolean;
        editingActivity: Activity | null;
        editingActivityIndex: number | null;
        selectedTemplate: ActivityTemplate | null;
    };
    previewMode: 'compact' | 'detailed';
}

const initialState: BuilderState = {
    draftLoop: null,
    isEditing: false,
    editingLoopId: null,
    currentStep: 'details',
    hasUnsavedChanges: false,
    validationErrors: {},
    dragAndDrop: {
        isDragging: false,
        draggedActivityIndex: null,
        dropTargetIndex: null,
    },
    activityBuilder: {
        isOpen: false,
        editingActivity: null,
        editingActivityIndex: null,
        selectedTemplate: null,
    },
    previewMode: 'compact',
};

const builderSlice = createSlice({
    name: 'builder',
    initialState,
    reducers: {
        // Draft loop management
        initializeDraftLoop: (state, action: PayloadAction<{ loop?: Loop; isEditing?: boolean }>) => {
            const { loop, isEditing = false } = action.payload;

            if (loop) {
                state.draftLoop = { ...loop };
                state.isEditing = isEditing;
                state.editingLoopId = loop.id;
            } else {
                state.draftLoop = {
                    title: '',
                    description: '',
                    activities: [],
                    category: null,
                    tags: [],
                    isRepeatable: false,
                    maxIterations: 1,
                    breakBetweenIterations: 0,
                    autoStart: false,
                    notificationsEnabled: true,
                    soundEnabled: true,
                    vibrationEnabled: true,
                    backgroundExecution: true,
                };
                state.isEditing = false;
                state.editingLoopId = null;
            }

            state.hasUnsavedChanges = false;
            state.validationErrors = {};
            state.currentStep = 'details';
        },

        updateDraftLoop: (state, action: PayloadAction<Partial<Loop>>) => {
            if (state.draftLoop) {
                state.draftLoop = { ...state.draftLoop, ...action.payload };
                state.hasUnsavedChanges = true;

                // Clear related validation errors
                if (action.payload.title) {
                    delete state.validationErrors.title;
                }
                if (action.payload.activities) {
                    delete state.validationErrors.activities;
                }
            }
        },

        clearDraftLoop: (state) => {
            state.draftLoop = null;
            state.isEditing = false;
            state.editingLoopId = null;
            state.hasUnsavedChanges = false;
            state.validationErrors = {};
            state.currentStep = 'details';
            state.activityBuilder = initialState.activityBuilder;
            state.dragAndDrop = initialState.dragAndDrop;
        },

        // Step navigation
        setCurrentStep: (state, action: PayloadAction<BuilderState['currentStep']>) => {
            state.currentStep = action.payload;
        },

        nextStep: (state) => {
            const steps: BuilderState['currentStep'][] = ['details', 'activities', 'settings', 'preview'];
            const currentIndex = steps.indexOf(state.currentStep);
            if (currentIndex < steps.length - 1) {
                state.currentStep = steps[currentIndex + 1];
            }
        },

        previousStep: (state) => {
            const steps: BuilderState['currentStep'][] = ['details', 'activities', 'settings', 'preview'];
            const currentIndex = steps.indexOf(state.currentStep);
            if (currentIndex > 0) {
                state.currentStep = steps[currentIndex - 1];
            }
        },

        // Activity management
        addActivity: (state, action: PayloadAction<Activity>) => {
            if (state.draftLoop) {
                if (!state.draftLoop.activities) {
                    state.draftLoop.activities = [];
                }
                state.draftLoop.activities.push(action.payload);
                state.hasUnsavedChanges = true;
                delete state.validationErrors.activities;
            }
        },

        updateActivity: (state, action: PayloadAction<{ index: number; activity: Activity }>) => {
            if (state.draftLoop?.activities) {
                const { index, activity } = action.payload;
                if (index >= 0 && index < state.draftLoop.activities.length) {
                    state.draftLoop.activities[index] = activity;
                    state.hasUnsavedChanges = true;
                }
            }
        },

        removeActivity: (state, action: PayloadAction<number>) => {
            if (state.draftLoop?.activities) {
                const index = action.payload;
                if (index >= 0 && index < state.draftLoop.activities.length) {
                    state.draftLoop.activities.splice(index, 1);
                    state.hasUnsavedChanges = true;
                }
            }
        },

        reorderActivities: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
            if (state.draftLoop?.activities) {
                const { fromIndex, toIndex } = action.payload;
                const activities = [...state.draftLoop.activities];
                const [removed] = activities.splice(fromIndex, 1);
                activities.splice(toIndex, 0, removed);
                state.draftLoop.activities = activities;
                state.hasUnsavedChanges = true;
            }
        },

        duplicateActivity: (state, action: PayloadAction<number>) => {
            if (state.draftLoop?.activities) {
                const index = action.payload;
                const activity = state.draftLoop.activities[index];
                if (activity) {
                    const duplicatedActivity: Activity = {
                        ...activity,
                        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: `${activity.title} (Copy)`,
                    };
                    state.draftLoop.activities.splice(index + 1, 0, duplicatedActivity);
                    state.hasUnsavedChanges = true;
                }
            }
        },

        // Activity builder
        openActivityBuilder: (state, action: PayloadAction<{
            activity?: Activity;
            activityIndex?: number;
            template?: ActivityTemplate;
        }>) => {
            const { activity, activityIndex, template } = action.payload;
            state.activityBuilder.isOpen = true;
            state.activityBuilder.editingActivity = activity || null;
            state.activityBuilder.editingActivityIndex = activityIndex ?? null;
            state.activityBuilder.selectedTemplate = template || null;
        },

        closeActivityBuilder: (state) => {
            state.activityBuilder.isOpen = false;
            state.activityBuilder.editingActivity = null;
            state.activityBuilder.editingActivityIndex = null;
            state.activityBuilder.selectedTemplate = null;
        },

        setSelectedTemplate: (state, action: PayloadAction<ActivityTemplate | null>) => {
            state.activityBuilder.selectedTemplate = action.payload;
        },

        // Drag and drop
        startDragging: (state, action: PayloadAction<number>) => {
            state.dragAndDrop.isDragging = true;
            state.dragAndDrop.draggedActivityIndex = action.payload;
            state.dragAndDrop.dropTargetIndex = null;
        },

        setDropTarget: (state, action: PayloadAction<number | null>) => {
            state.dragAndDrop.dropTargetIndex = action.payload;
        },

        endDragging: (state) => {
            if (state.dragAndDrop.draggedActivityIndex !== null &&
                state.dragAndDrop.dropTargetIndex !== null &&
                state.dragAndDrop.draggedActivityIndex !== state.dragAndDrop.dropTargetIndex) {

                // Perform the reorder
                if (state.draftLoop?.activities) {
                    const fromIndex = state.dragAndDrop.draggedActivityIndex;
                    const toIndex = state.dragAndDrop.dropTargetIndex;
                    const activities = [...state.draftLoop.activities];
                    const [removed] = activities.splice(fromIndex, 1);
                    activities.splice(toIndex, 0, removed);
                    state.draftLoop.activities = activities;
                    state.hasUnsavedChanges = true;
                }
            }

            state.dragAndDrop.isDragging = false;
            state.dragAndDrop.draggedActivityIndex = null;
            state.dragAndDrop.dropTargetIndex = null;
        },

        cancelDragging: (state) => {
            state.dragAndDrop.isDragging = false;
            state.dragAndDrop.draggedActivityIndex = null;
            state.dragAndDrop.dropTargetIndex = null;
        },

        // Validation
        setValidationErrors: (state, action: PayloadAction<BuilderState['validationErrors']>) => {
            state.validationErrors = action.payload;
        },

        clearValidationErrors: (state) => {
            state.validationErrors = {};
        },

        validateDraftLoop: (state) => {
            const errors: BuilderState['validationErrors'] = {};

            if (!state.draftLoop) {
                errors.general = 'No draft loop to validate';
            } else {
                // Validate title
                if (!state.draftLoop.title || state.draftLoop.title.trim().length === 0) {
                    errors.title = 'Title is required';
                } else if (state.draftLoop.title.trim().length < 3) {
                    errors.title = 'Title must be at least 3 characters';
                } else if (state.draftLoop.title.trim().length > 100) {
                    errors.title = 'Title must be less than 100 characters';
                }

                // Validate activities
                if (!state.draftLoop.activities || state.draftLoop.activities.length === 0) {
                    errors.activities = 'At least one activity is required';
                } else {
                    // Validate individual activities
                    const invalidActivities = state.draftLoop.activities.filter(activity =>
                        !activity.title ||
                        activity.title.trim().length === 0 ||
                        !activity.duration ||
                        activity.duration <= 0
                    );

                    if (invalidActivities.length > 0) {
                        errors.activities = 'All activities must have a title and valid duration';
                    }
                }
            }

            state.validationErrors = errors;
        },

        // Preview mode
        setPreviewMode: (state, action: PayloadAction<BuilderState['previewMode']>) => {
            state.previewMode = action.payload;
        },

        // Utility actions
        markSaved: (state) => {
            state.hasUnsavedChanges = false;
        },

        resetBuilderState: () => initialState,
    },
});

export const {
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
    setSelectedTemplate,
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
} = builderSlice.actions;

export default builderSlice.reducer; 