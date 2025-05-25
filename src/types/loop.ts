// src/types/loop.ts
import { BaseEntry } from './baseEntry';

// Navigation target for activities
export interface NavigateTarget {
    type: 'note' | 'action' | 'spark' | 'path' | 'saga';
    mode: 'create' | 'review' | 'view' | 'select';
    filter?: {
        starred?: boolean;
        done?: boolean;
        categoryId?: string;
        tags?: string[];
    };
}

// Reusable activity template
export interface ActivityTemplate {
    id: string;
    title: string;
    icon: string;
    description?: string;
    type?: 'mind' | 'body' | 'planning' | 'review' | 'custom';
    navigateTarget?: NavigateTarget;
    isPredefined: boolean;
    createdAt: string;
    updatedAt: string;
}

// Quantity configuration for activity instances
export interface ActivityQuantity {
    value: number;
    unit: string; // e.g., "pages", "sets", "reps", "minutes"
}

// Sub-action within an activity instance
export interface ActivitySubAction {
    id: string;
    text: string;
    done: boolean;
}

// Activity instance within a specific loop (fully customizable)
export interface LoopActivityInstance {
    id: string;
    templateId: string; // Reference to ActivityTemplate
    overriddenTitle?: string; // Optional custom title for this instance
    quantity?: ActivityQuantity; // Number + unit (e.g., 4 pages, 3 sets)
    durationMinutes?: number; // Duration in minutes
    subActions?: ActivitySubAction[]; // Checklist of sub-actions
    navigateTarget?: NavigateTarget; // Can override template's navigation target
    autoCompleteOnTimerEnd?: boolean; // Whether to auto-complete when timer ends
    order: number; // Position in the loop sequence
}

// Main Loop interface
export interface Loop extends BaseEntry {
    type: 'loop';
    title: string;
    description?: string;
    activityInstances: LoopActivityInstance[]; // Ordered sequence of activities

    // Legacy support for backward compatibility
    items?: LoopItem[];
    activities?: LoopActivity[];

    // Execution tracking
    currentActivityIndex?: number;
    isExecuting?: boolean;
    lastExecutionDate?: string;

    // Scheduling (future enhancement)
    frequency?: string;
    startTimeByDay?: Record<string, string>;
    active?: boolean;
    startDate?: string;
    endDate?: string;
}

// Execution state for persistence across app sessions
export interface LoopExecutionState {
    id?: string;
    loopId: string;
    currentActivityIndex: number;
    startedAt: string;
    completedActivities: string[]; // IDs of completed activity instances
    completedSubActions: Record<string, string[]>; // Per activity: completed sub-action IDs
    isPaused: boolean;
    pausedAt?: string;
    timeSpentSeconds: number; // Total time spent in this execution
    activityTimeTracking: Record<string, number>; // Time spent per activity instance
    // Enhanced time tracking
    activityStartTimes: Record<string, string>; // ISO timestamps when each activity started
    activityEndTimes: Record<string, string>; // ISO timestamps when each activity ended
    activityElapsedSeconds: Record<string, number>; // Accumulated time per activity (for navigation scenarios)
    lastActiveTimestamp: string; // Last time the execution was active (for background recovery)
    backgroundStartTime?: string; // When app went to background (if timer was running)
}

// Result of completing an activity
export interface ActivityExecutionResult {
    activityId: string;
    completed: boolean;
    skipped: boolean;
    timeSpentSeconds: number;
    completedSubActions: string[];
    notes?: string; // Optional notes from the user
}

// Legacy types for backward compatibility
export interface LoopItem {
    id: string;
    name: string;
    description?: string;
    durationMinutes?: number;
    quantity?: string;
    icon?: string;
}

export interface LoopActivity {
    id: string;
    baseActivityId: string;
    durationSeconds?: number;
    subActions?: string[];
    navigateTarget?: NavigateTarget;
    order: number;
}

// UI-specific interfaces
export interface ActivityPickerConfiguration {
    templateId: string;
    overriddenTitle?: string;
    quantity?: ActivityQuantity;
    durationMinutes?: number;
    subActions?: string[];
    navigateTarget?: NavigateTarget;
}

export interface LoopCreationDraft {
    title: string;
    description: string;
    activityInstances: LoopActivityInstance[];
}

// Progress tracking for current loop execution
export interface LoopProgressInfo {
    currentIndex: number;
    totalActivities: number;
    completedCount: number;
    progress: number; // 0-100 percentage
    isComplete: boolean;
    currentActivity: LoopActivityInstance;
    nextActivity?: LoopActivityInstance;
}