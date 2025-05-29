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
    | 'focus'           // Focus work session
    | 'exercise'        // Exercise activity
    | 'meditation'      // Meditation activity
    | 'reading'         // Reading activity
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
    | 'stopped'         // Manually stopped
    | 'cancelled'       // Cancelled by user
    | 'skipped';        // Activity was skipped

export type ExecutionStatus = LoopExecutionStatus;

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
    duration: number;

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
    completedAt?: string | Date;

    /** Actual duration taken (may differ from planned duration) */
    actualDuration?: number;

    /** Whether this activity is optional */
    isOptional?: boolean;

    /** Tags for categorization */
    tags?: string[];
}

/**
 * Activity Template - Reusable building blocks for activities
 * Spec-compliant template system with emoji-based categories
 */
export interface ActivityTemplate {
    /** Unique identifier */
    id: string;

    /** Template title (required) */
    title: string;

    /** Emoji for the template (required - no icons, only emojis) */
    emoji: string;

    /** Optional description */
    description?: string;

    /** Optional linked target for navigation */
    linkedTarget?: 'notes' | 'sparks' | 'actions' | 'paths';

    /** Category for grouping in tabs */
    category: string;

    /** Creation timestamp */
    createdAt: Date;

    /** Last updated timestamp */
    updatedAt: Date;
}

/**
 * Activity Instance - Customized activities based on templates
 * Per specification with quantity, duration, sub-items, and linked targets
 */
export interface ActivityInstance {
    /** Unique identifier */
    id: string;

    /** Reference to the template */
    templateId: string;

    /** Optional title override */
    title?: string;

    /** Optional quantity with number and unit */
    quantity?: {
        number: number;
        unit: string; // "pages", "sets", "reps", etc.
    };

    /** Optional duration in minutes only */
    duration?: number;

    /** Optional sub-items with labels and completion status */
    subItems?: {
        label: string;
        completed: boolean;
    }[];

    /** Optional linked target override */
    linkedTarget?: 'notes' | 'sparks' | 'actions' | 'paths';

    /** Order in the loop */
    order: number;

    /** Execution status */
    status?: 'pending' | 'active' | 'completed' | 'skipped';

    /** Start time for execution */
    startedAt?: string;

    /** Completion time */
    completedAt?: string;
}

/**
 * Loop execution state for background persistence
 */
export interface ExecutionState {
    /** Unique identifier for this execution */
    id: string;

    /** ID of the loop being executed */
    loopId: string;

    /** Reference to the loop being executed */
    loop: Loop;

    /** Current execution status */
    status: LoopExecutionStatus;

    /** Index of currently active activity */
    currentActivityIndex: number;

    /** Current cycle number (for repeating loops) */
    currentCycle: number;

    /** Current iteration within the loop */
    currentIteration: number;

    /** Activities with their current states */
    activities: Activity[];

    /** Completed activities in this execution */
    completedActivities: Activity[];

    /** When execution started */
    startedAt: string;

    /** Start time as timestamp */
    startTime: number;

    /** Whether execution is currently paused */
    isPaused: boolean;

    /** When execution was paused (if applicable) */
    pausedAt?: string;

    /** Total time spent paused */
    pausedDuration: number;

    /** When execution completed */
    completedAt?: string;

    /** Total time elapsed in seconds */
    totalElapsed: number;

    /** Time remaining for current activity in seconds */
    currentActivityTimeRemaining?: number;

    /** Progress of current activity (0-1) */
    activityProgress: number;

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

    /** Title of the loop that was executed */
    loopTitle: string;

    /** When execution started */
    startedAt: string;

    /** Start time as Date object */
    startTime: Date;

    /** When execution completed */
    completedAt?: string;

    /** End time as Date object */
    endTime?: Date;

    /** Number of times execution was paused */
    pausedCount?: number;

    /** Number of activities skipped */
    skippedActivities?: number;

    /** When execution ended */
    endedAt?: string;

    /** Final status */
    status: LoopExecutionStatus;

    /** Final status (alias for compatibility) */
    finalStatus: LoopExecutionStatus;

    /** Total duration in seconds */
    duration: number;

    /** Total duration in seconds (alias for compatibility) */
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

    /** Total number of activities in the loop */
    totalActivities?: number;

    /** Number of iterations completed */
    iterationsCompleted?: number;
}

/**
 * Enhanced Loop interface with robust features
 * Core structure + background execution, notifications, and scheduling
 */
export interface Loop {
    /** Unique identifier */
    id: string;

    /** Loop title (required) */
    title: string;

    /** Optional description */
    description?: string;

    /** Ordered list of activity instances */
    activities: ActivityInstance[];

    /** Creation timestamp */
    createdAt: Date;

    /** Last updated timestamp */
    updatedAt: Date;

    /** Tags for organization */
    tags: string[];

    /** Optional category ID */
    categoryId?: string;

    /** Allow background execution */
    backgroundExecution: boolean;

    /** Notification preferences */
    notifications: NotificationSettings;

    /** Optional scheduling settings */
    scheduling?: ScheduleSettings;
}

/**
 * Notification Settings - Comprehensive notification preferences
 */
export interface NotificationSettings {
    /** Whether notifications are enabled */
    enabled: boolean;

    /** Activity reminder notifications */
    activityReminders: boolean;

    /** Session progress notifications */
    sessionProgress: boolean;

    /** Completion celebration notifications */
    completionCelebration: boolean;

    /** Sound enabled for notifications */
    soundEnabled: boolean;

    /** Vibration enabled for notifications */
    vibrationEnabled: boolean;

    /** Persistent overlay during execution */
    persistentOverlay: boolean;
}

/**
 * Schedule Settings - Flexible scheduling system
 */
export interface ScheduleSettings {
    /** Whether scheduling is enabled */
    enabled: boolean;

    /** Frequency of scheduling */
    frequency: 'daily' | 'weekly' | 'custom';

    /** Time in HH:mm format */
    time: string;

    /** Days of week (0-6, Sunday-Saturday) */
    days: number[];

    /** Reminder minutes before scheduled time */
    reminderMinutes: number;

    /** Whether to auto-start when scheduled */
    autoStart: boolean;
}

/**
 * Execution Session - Robust session tracking with background task IDs
 */
export interface ExecutionSession {
    /** Unique session identifier */
    id: string;

    /** Loop being executed */
    loopId: string;

    /** Session start time */
    startTime: Date;

    /** Session end time */
    endTime?: Date;

    /** Current activity index */
    currentActivityIndex: number;

    /** Session status */
    status: 'running' | 'paused' | 'completed' | 'cancelled';

    /** Progress for each activity */
    activityProgress: ActivityProgress[];

    /** Total session duration in seconds */
    totalDuration: number;

    /** Total paused duration in seconds */
    pausedDuration: number;

    /** Background task ID for OS background execution */
    backgroundTaskId?: string;

    /** Persistent notification ID */
    persistentNotificationId?: string;
}

/**
 * Activity Progress tracking
 */
export interface ActivityProgress {
    /** Activity instance ID */
    activityId: string;

    /** Activity execution status */
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';

    /** Progress percentage (0-1) */
    progress?: number;

    /** Whether activity is completed */
    completed?: boolean;

    /** Whether activity was skipped */
    skipped?: boolean;

    /** Start time */
    startTime?: Date;

    /** Start time (alias for compatibility) */
    startedAt?: Date;

    /** Completion time */
    endTime?: Date;

    /** Completion time (alias for compatibility) */
    completedAt?: Date;

    /** Completed sub-item indices */
    completedSubItems?: number[];

    /** Sub-items completion status (legacy) */
    subItemsProgress?: boolean[];
}

/**
 * Loop builder state for creating/editing loops
 */
export interface LoopBuilderState {
    /** Loop title */
    title: string;

    /** Loop description */
    description: string;

    /** Loop tags */
    tags: string[];

    /** Loop activities */
    activities: Activity[];

    /** Whether the loop repeats */
    isRepeating: boolean;

    /** Number of repeat cycles */
    repeatCycles: number | null;

    /** Whether background execution is allowed */
    allowBackgroundExecution: boolean;

    /** Whether notifications are enabled */
    enableNotifications: boolean;

    /** Estimated duration */
    estimatedDuration: number;

    /** Settings object for compatibility */
    settings: {
        isRepeating: boolean;
        repeatCycles: number | null;
        backgroundExecution: boolean;
        notifications: {
            enabled: boolean;
            activityStart: boolean;
            activityComplete: boolean;
            loopComplete: boolean;
        };
    };

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

// All types are already exported above 