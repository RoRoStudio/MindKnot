/**
 * Loop Hooks Index
 * Centralized exports for all loop-related hooks
 */

export { useLoops } from './useLoops';
export { useActivityTemplates } from './useActivityTemplates';
export { useLoopExecution } from './useLoopExecution';
export { useBackgroundExecution } from './useBackgroundExecution';
export { useLoopNotifications } from './useLoopNotifications';
export { useLoopScheduling } from './useLoopScheduling';

// Re-export types for convenience
export type {
    UseLoopsReturn,
} from './useLoops';

export type {
    UseActivityTemplatesReturn,
} from './useActivityTemplates';

export type {
    UseLoopExecutionReturn,
} from './useLoopExecution';

export type {
    UseBackgroundExecutionReturn,
} from './useBackgroundExecution';

export type {
    UseLoopNotificationsReturn,
} from './useLoopNotifications';

export type {
    UseLoopSchedulingReturn,
    ScheduledLoop,
} from './useLoopScheduling'; 