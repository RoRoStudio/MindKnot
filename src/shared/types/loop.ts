/**
 * Loop type definitions for the MindKnot app
 * Supports background execution, templates, and comprehensive loop management
 */

import { BaseEntry } from './baseEntry';

/**
 * Activity types that can be included in a loop
 */
export type ActivityType =
    | 'timer'           // Timed activity (e.g., meditation, exercise)
    | 'task'            // Simple task to complete
    | 'break'           // Rest/break period
    | 'reflection'      // Reflection or journaling prompt
    | 'movement'        // Physical movement activity
    | 'breathing'       // Breathing exercise
    | 'custom';         // Custom user-defined activity

/**
 * Activity execution status
 */
export type ActivityStatus =
    | 'pending'         // Not yet started
    | 'active'          // Currently executing
    | 'completed'       // Successfully completed
    | 'skipped'         // Skipped by user
    | 'paused';         // Temporarily paused

/**
 * Loop execution status
 */
export type LoopExecutionStatus =
    | 'idle'            // Not running
    | 'running'         // Currently executing
    | 'paused'          // Temporarily paused
    | 'completed'       // Successfully completed
    | 'stopped';        // Manually stopped

/**
 * Background execution state
 */
export type BackgroundState =
    | 'foreground'      // App is in foreground
    | 'background'      // App is in background but execution continues
    | 'suspended'       // App was closed, execution suspended
    | 'recovered';      // App restarted, execution recovered

/**
 * Individual activity within a loop
 */
export interface Activity {
    /** Unique identifier for the activity */
    id: string;

    /** Display name for the activity */
    title: string;

    /** Optional description or instructions */
    description?: string;

    /** Type of activity */
    type: ActivityType;

    /** Duration in seconds (for timed activities) */
    duration?: number;

    /** Whether this activity can be skipped */
    skippable: boolean;

    /** Icon name for the activity */
    icon?: string;

    /** Color for the activity (theme color key) */
    color?: string;

    /** Custom instructions or prompts */
    instructions?: string;

    /** Audio cue or sound to play */
    audioUrl?: string;

    /** Whether to show a notification when starting */
    notifyOnStart: boolean;

    /** Whether to show a notification when completing */
    notifyOnComplete: boolean;

    /** Order within the loop */
    order: number;

    /** Current execution status */
    status: ActivityStatus;

    /** Time when activity was started (ISO string) */
    startedAt?: string;

    /** Time when activity was completed (ISO string) */
    completedAt?: string;

    /** Actual duration taken (may differ from planned duration) */
    actualDuration?: number;
}

/**
 * Activity template for reuse across loops
 */
export interface ActivityTemplate {
    /** Unique identifier for the template */
    id: string;

    /** Template name */
    name: string;

    /** Template description */
    description?: string;

    /** Type of activity */
    type: ActivityType;

    /** Default duration in seconds */
    defaultDuration?: number;

    /** Default instructions */
    defaultInstructions?: string;

    /** Default icon */
    defaultIcon?: string;

    /** Default color */
    defaultColor?: string;

    /** Whether activities from this template are skippable by default */
    defaultSkippable: boolean;

    /** Whether to notify on start by default */
    defaultNotifyOnStart: boolean;

    /** Whether to notify on complete by default */
    defaultNotifyOnComplete: boolean;

    /** Category for organization */
    category?: string;

    /** Whether this is a built-in template */
    isBuiltIn: boolean;

    /** Creation timestamp */
    createdAt: string;

    /** Last modified timestamp */
    updatedAt: string;
}

/**
 * Loop execution state for background persistence
 */
export interface ExecutionState {
    /** Unique identifier for this execution */
    id: string;

    /** ID of the loop being executed */
    loopId: string;

    /** Current execution status */
    status: LoopExecutionStatus;

    /** Index of currently active activity */
    currentActivityIndex: number;

    /** Current cycle number (for repeating loops) */
    currentCycle: number;

    /** Activities with their current states */
    activities: Activity[];

    /** When execution started */
    startedAt: string;

    /** When execution was paused (if applicable) */
    pausedAt?: string;

    /** When execution completed */
    completedAt?: string;

    /** Total time elapsed in seconds */
    totalElapsed: number;

    /** Time remaining for current activity in seconds */
    currentActivityTimeRemaining?: number;

    /** Background execution state */
    backgroundState: BackgroundState;

    /** When app went to background */
    backgroundStartTime?: number;

    /** Total time spent in background */
    backgroundDuration: number;

    /** Whether execution should continue in background */
    continueInBackground: boolean;

    /** Progress percentage (0-100) */
    progress: number;

    /** Any error that occurred during execution */
    error?: string;

    /** Last saved timestamp for recovery */
    lastSavedAt: string;
}

/**
 * Loop execution history entry
 */
export interface ExecutionHistory {
    /** Unique identifier */
    id: string;

    /** ID of the loop that was executed */
    loopId: string;

    /** When execution started */
    startedAt: string;

    /** When execution completed */
    completedAt?: string;

    /** Final status */
    finalStatus: LoopExecutionStatus;

    /** Total duration in seconds */
    totalDuration: number;

    /** Number of cycles completed */
    cyclesCompleted: number;

    /** Number of activities completed */
    activitiesCompleted: number;

    /** Number of activities skipped */
    activitiesSkipped: number;

    /** Time spent in background */
    backgroundTime: number;

    /** Whether execution was interrupted */
    wasInterrupted: boolean;

    /** User notes about the execution */
    notes?: string;
}

/**
 * Main Loop interface extending BaseEntry
 */
export interface Loop extends BaseEntry {
    /** Loop-specific type identifier */
    type: 'loop';

    /** Activities in this loop */
    activities: Activity[];

    /** Whether the loop should repeat */
    isRepeating: boolean;

    /** Number of cycles to repeat (0 = infinite) */
    repeatCycles: number;

    /** Break duration between cycles in seconds */
    cycleBreaKDuration: number;

    /** Whether to continue execution in background */
    allowBackgroundExecution: boolean;

    /** Whether to show notifications during execution */
    enableNotifications: boolean;

    /** Whether to play audio cues */
    enableAudio: boolean;

    /** Total estimated duration in seconds */
    estimatedDuration: number;

    /** Current execution state (if running) */
    currentExecution?: ExecutionState;

    /** Execution history */
    executionHistory: ExecutionHistory[];

    /** Template this loop was created from (if any) */
    templateId?: string;

    /** Whether this loop is a template itself */
    isTemplate: boolean;

    /** Template category (if this is a template) */
    templateCategory?: string;

    /** Number of times this loop has been executed */
    executionCount: number;

    /** Average completion rate (0-1) */
    averageCompletionRate: number;

    /** Last execution date */
    lastExecutedAt?: string;

    /** User's favorite status */
    isFavorite: boolean;

    /** Difficulty level (1-5) */
    difficulty: number;

    /** Tags for organization and search */
    tags: string[];
}

/**
 * Loop builder state for creating/editing loops
 */
export interface LoopBuilderState {
    /** Loop being built/edited */
    loop: Partial<Loop>;

    /** Current step in the builder */
    currentStep: 'basic' | 'activities' | 'settings' | 'preview';

    /** Whether the builder is in edit mode */
    isEditing: boolean;

    /** Available activity templates */
    availableTemplates: ActivityTemplate[];

    /** Validation errors */
    errors: Record<string, string>;

    /** Whether the loop is valid and can be saved */
    isValid: boolean;

    /** Unsaved changes flag */
    hasUnsavedChanges: boolean;
}

/**
 * Loop filter and search options
 */
export interface LoopFilters {
    /** Search query */
    query?: string;

    /** Filter by category */
    category?: string;

    /** Filter by tags */
    tags?: string[];

    /** Filter by difficulty */
    difficulty?: number[];

    /** Filter by duration range */
    durationRange?: {
        min: number;
        max: number;
    };

    /** Filter by template status */
    isTemplate?: boolean;

    /** Filter by favorite status */
    isFavorite?: boolean;

    /** Sort options */
    sortBy: 'name' | 'createdAt' | 'lastExecutedAt' | 'executionCount' | 'difficulty';

    /** Sort direction */
    sortDirection: 'asc' | 'desc';
}

/**
 * Background task configuration
 */
export interface BackgroundTaskConfig {
    /** Whether background execution is enabled */
    enabled: boolean;

    /** Maximum background execution time in seconds */
    maxBackgroundTime: number;

    /** Update frequency in background (seconds) */
    backgroundUpdateInterval: number;

    /** Whether to show persistent notification */
    showPersistentNotification: boolean;

    /** Notification title */
    notificationTitle: string;

    /** Notification body template */
    notificationBody: string;
}

/**
 * Loop execution preferences
 */
export interface ExecutionPreferences {
    /** Default background execution setting */
    defaultAllowBackground: boolean;

    /** Default notification setting */
    defaultEnableNotifications: boolean;

    /** Default audio setting */
    defaultEnableAudio: boolean;

    /** Auto-pause when app goes to background */
    autoPauseOnBackground: boolean;

    /** Auto-resume when app comes to foreground */
    autoResumeOnForeground: boolean;

    /** Keep screen awake during execution */
    keepScreenAwake: boolean;

    /** Vibration patterns for different events */
    vibrationEnabled: boolean;

    /** Voice guidance enabled */
    voiceGuidanceEnabled: boolean;
}

// Export all types
export type {
    ActivityType,
    ActivityStatus,
    LoopExecutionStatus,
    BackgroundState,
    Activity,
    ActivityTemplate,
    ExecutionState,
    ExecutionHistory,
    Loop,
    LoopBuilderState,
    LoopFilters,
    BackgroundTaskConfig,
    ExecutionPreferences,
}; 