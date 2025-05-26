import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { BuilderState } from './builderSlice';

// Base selectors
export const selectBuilderState = (state: RootState): BuilderState => state.builder;

export const selectDraftLoop = createSelector(
    [selectBuilderState],
    (builderState) => builderState.draftLoop
);

export const selectIsEditing = createSelector(
    [selectBuilderState],
    (builderState) => builderState.isEditing
);

export const selectEditingLoopId = createSelector(
    [selectBuilderState],
    (builderState) => builderState.editingLoopId
);

export const selectCurrentStep = createSelector(
    [selectBuilderState],
    (builderState) => builderState.currentStep
);

export const selectHasUnsavedChanges = createSelector(
    [selectBuilderState],
    (builderState) => builderState.hasUnsavedChanges
);

export const selectValidationErrors = createSelector(
    [selectBuilderState],
    (builderState) => builderState.validationErrors
);

export const selectDragAndDropState = createSelector(
    [selectBuilderState],
    (builderState) => builderState.dragAndDrop
);

export const selectActivityBuilderState = createSelector(
    [selectBuilderState],
    (builderState) => builderState.activityBuilder
);

export const selectPreviewMode = createSelector(
    [selectBuilderState],
    (builderState) => builderState.previewMode
);

// Computed selectors
export const selectDraftActivities = createSelector(
    [selectDraftLoop],
    (draftLoop) => draftLoop?.activities || []
);

export const selectDraftLoopTitle = createSelector(
    [selectDraftLoop],
    (draftLoop) => draftLoop?.title || ''
);

export const selectDraftLoopDescription = createSelector(
    [selectDraftLoop],
    (draftLoop) => draftLoop?.description || ''
);

export const selectDraftLoopCategory = createSelector(
    [selectDraftLoop],
    (draftLoop) => draftLoop?.category || null
);

export const selectDraftLoopTags = createSelector(
    [selectDraftLoop],
    (draftLoop) => draftLoop?.tags || []
);

export const selectDraftLoopSettings = createSelector(
    [selectDraftLoop],
    (draftLoop) => {
        if (!draftLoop) return null;

        return {
            isRepeatable: draftLoop.isRepeatable || false,
            maxIterations: draftLoop.maxIterations || 1,
            breakBetweenIterations: draftLoop.breakBetweenIterations || 0,
            autoStart: draftLoop.autoStart || false,
            notificationsEnabled: draftLoop.notificationsEnabled ?? true,
            soundEnabled: draftLoop.soundEnabled ?? true,
            vibrationEnabled: draftLoop.vibrationEnabled ?? true,
            backgroundExecution: draftLoop.backgroundExecution ?? true,
        };
    }
);

export const selectDraftLoopStats = createSelector(
    [selectDraftActivities, selectDraftLoopSettings],
    (activities, settings) => {
        const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
        const totalIterations = settings?.maxIterations || 1;
        const totalBreakTime = settings?.isRepeatable && totalIterations > 1
            ? (totalIterations - 1) * (settings.breakBetweenIterations || 0)
            : 0;

        return {
            activityCount: activities.length,
            totalDuration,
            totalDurationWithBreaks: totalDuration + totalBreakTime,
            totalDurationAllIterations: (totalDuration * totalIterations) + totalBreakTime,
            averageActivityDuration: activities.length > 0 ? totalDuration / activities.length : 0,
            shortestActivity: activities.length > 0 ? Math.min(...activities.map(a => a.duration)) : 0,
            longestActivity: activities.length > 0 ? Math.max(...activities.map(a => a.duration)) : 0,
            totalIterations,
            breakTime: settings?.breakBetweenIterations || 0,
        };
    }
);

export const selectIsValidDraftLoop = createSelector(
    [selectDraftLoop, selectValidationErrors],
    (draftLoop, errors) => {
        if (!draftLoop) return false;

        // Check if there are any validation errors
        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) return false;

        // Basic validation
        const hasTitle = draftLoop.title && draftLoop.title.trim().length >= 3;
        const hasActivities = draftLoop.activities && draftLoop.activities.length > 0;
        const activitiesValid = draftLoop.activities?.every(activity =>
            activity.title &&
            activity.title.trim().length > 0 &&
            activity.duration > 0
        );

        return hasTitle && hasActivities && activitiesValid;
    }
);

export const selectCanSaveDraftLoop = createSelector(
    [selectIsValidDraftLoop, selectHasUnsavedChanges],
    (isValid, hasChanges) => isValid && hasChanges
);

export const selectCanNavigateToStep = createSelector(
    [selectCurrentStep, selectDraftLoop, selectValidationErrors],
    (currentStep, draftLoop, errors) => {
        return {
            details: true, // Can always go to details
            activities: true, // Can always go to activities
            settings: draftLoop?.title && draftLoop.title.trim().length > 0, // Need title
            preview: draftLoop?.title &&
                draftLoop.title.trim().length > 0 &&
                draftLoop.activities &&
                draftLoop.activities.length > 0 &&
                Object.keys(errors).length === 0, // Need valid loop
        };
    }
);

export const selectStepProgress = createSelector(
    [selectDraftLoop, selectValidationErrors],
    (draftLoop, errors) => {
        const steps = {
            details: false,
            activities: false,
            settings: false,
            preview: false,
        };

        if (!draftLoop) return steps;

        // Details step
        steps.details = !!(draftLoop.title && draftLoop.title.trim().length >= 3);

        // Activities step
        steps.activities = !!(draftLoop.activities &&
            draftLoop.activities.length > 0 &&
            draftLoop.activities.every(a => a.title && a.duration > 0));

        // Settings step (optional, so always complete)
        steps.settings = true;

        // Preview step (requires all previous steps and no errors)
        steps.preview = steps.details && steps.activities && Object.keys(errors).length === 0;

        return steps;
    }
);

export const selectCompletedStepsCount = createSelector(
    [selectStepProgress],
    (stepProgress) => {
        return Object.values(stepProgress).filter(Boolean).length;
    }
);

export const selectOverallProgress = createSelector(
    [selectCompletedStepsCount],
    (completedSteps) => {
        return completedSteps / 4; // 4 total steps
    }
);

// Activity builder selectors
export const selectIsActivityBuilderOpen = createSelector(
    [selectActivityBuilderState],
    (activityBuilder) => activityBuilder.isOpen
);

export const selectEditingActivity = createSelector(
    [selectActivityBuilderState],
    (activityBuilder) => activityBuilder.editingActivity
);

export const selectEditingActivityIndex = createSelector(
    [selectActivityBuilderState],
    (activityBuilder) => activityBuilder.editingActivityIndex
);

export const selectSelectedTemplateInBuilder = createSelector(
    [selectActivityBuilderState],
    (activityBuilder) => activityBuilder.selectedTemplate
);

export const selectIsEditingExistingActivity = createSelector(
    [selectEditingActivity, selectEditingActivityIndex],
    (editingActivity, editingIndex) => !!(editingActivity && editingIndex !== null)
);

// Drag and drop selectors
export const selectIsDragging = createSelector(
    [selectDragAndDropState],
    (dragAndDrop) => dragAndDrop.isDragging
);

export const selectDraggedActivityIndex = createSelector(
    [selectDragAndDropState],
    (dragAndDrop) => dragAndDrop.draggedActivityIndex
);

export const selectDropTargetIndex = createSelector(
    [selectDragAndDropState],
    (dragAndDrop) => dragAndDrop.dropTargetIndex
);

export const selectCanDropAtIndex = createSelector(
    [selectDraggedActivityIndex, selectDraftActivities],
    (draggedIndex, activities) => (targetIndex: number) => {
        if (draggedIndex === null) return false;
        if (targetIndex < 0 || targetIndex >= activities.length) return false;
        return targetIndex !== draggedIndex;
    }
);

// Validation selectors
export const selectHasValidationErrors = createSelector(
    [selectValidationErrors],
    (errors) => Object.keys(errors).length > 0
);

export const selectValidationErrorsArray = createSelector(
    [selectValidationErrors],
    (errors) => Object.entries(errors).map(([field, message]) => ({ field, message }))
);

export const selectHasTitleError = createSelector(
    [selectValidationErrors],
    (errors) => !!errors.title
);

export const selectHasActivitiesError = createSelector(
    [selectValidationErrors],
    (errors) => !!errors.activities
);

export const selectHasGeneralError = createSelector(
    [selectValidationErrors],
    (errors) => !!errors.general
);

// Step navigation selectors
export const selectCanGoToNextStep = createSelector(
    [selectCurrentStep, selectCanNavigateToStep],
    (currentStep, canNavigate) => {
        const steps: (keyof typeof canNavigate)[] = ['details', 'activities', 'settings', 'preview'];
        const currentIndex = steps.indexOf(currentStep);
        const nextStep = steps[currentIndex + 1];

        return nextStep ? canNavigate[nextStep] : false;
    }
);

export const selectCanGoToPreviousStep = createSelector(
    [selectCurrentStep],
    (currentStep) => {
        const steps = ['details', 'activities', 'settings', 'preview'];
        return steps.indexOf(currentStep) > 0;
    }
);

export const selectNextStepName = createSelector(
    [selectCurrentStep],
    (currentStep) => {
        const steps = ['details', 'activities', 'settings', 'preview'];
        const currentIndex = steps.indexOf(currentStep);
        return steps[currentIndex + 1] || null;
    }
);

export const selectPreviousStepName = createSelector(
    [selectCurrentStep],
    (currentStep) => {
        const steps = ['details', 'activities', 'settings', 'preview'];
        const currentIndex = steps.indexOf(currentStep);
        return currentIndex > 0 ? steps[currentIndex - 1] : null;
    }
);

// Utility selectors
export const selectBuilderMode = createSelector(
    [selectIsEditing, selectEditingLoopId],
    (isEditing, editingLoopId) => ({
        isCreating: !isEditing,
        isEditing,
        editingLoopId,
    })
);

export const selectShouldShowUnsavedWarning = createSelector(
    [selectHasUnsavedChanges, selectIsValidDraftLoop],
    (hasChanges, isValid) => hasChanges && isValid
);

export const selectBuilderSummary = createSelector(
    [
        selectDraftLoop,
        selectCurrentStep,
        selectStepProgress,
        selectOverallProgress,
        selectHasUnsavedChanges,
        selectIsValidDraftLoop,
        selectValidationErrors,
    ],
    (draftLoop, currentStep, stepProgress, overallProgress, hasChanges, isValid, errors) => ({
        draftLoop,
        currentStep,
        stepProgress,
        overallProgress,
        hasUnsavedChanges: hasChanges,
        isValid,
        hasErrors: Object.keys(errors).length > 0,
        errorCount: Object.keys(errors).length,
        canSave: isValid && hasChanges,
    })
); 