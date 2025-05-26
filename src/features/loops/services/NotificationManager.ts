/**
 * NotificationManager Service
 * 
 * Handles all notification functionality for loop execution.
 * Manages activity notifications, background execution alerts, and completion notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Activity, ExecutionState, Loop } from '../../../shared/types/loop';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export interface NotificationConfig {
    /** Whether notifications are enabled */
    enabled: boolean;
    /** Whether to show activity start notifications */
    showActivityStart: boolean;
    /** Whether to show activity completion notifications */
    showActivityComplete: boolean;
    /** Whether to show loop completion notifications */
    showLoopComplete: boolean;
    /** Whether to show background execution notifications */
    showBackgroundExecution: boolean;
    /** Whether to play sounds */
    playSound: boolean;
    /** Whether to use vibration */
    useVibration: boolean;
    /** Custom sound for notifications */
    soundName?: string;
}

const DEFAULT_CONFIG: NotificationConfig = {
    enabled: true,
    showActivityStart: true,
    showActivityComplete: true,
    showLoopComplete: true,
    showBackgroundExecution: true,
    playSound: true,
    useVibration: true,
};

export interface ScheduledNotification {
    /** Notification identifier */
    id: string;
    /** Type of notification */
    type: 'activity_start' | 'activity_complete' | 'loop_complete' | 'background_reminder';
    /** When the notification should trigger */
    triggerAt: Date;
    /** Associated activity or loop ID */
    entityId: string;
    /** Notification content */
    content: {
        title: string;
        body: string;
        data?: any;
    };
}

export class NotificationManager {
    private static instance: NotificationManager;
    private config: NotificationConfig = DEFAULT_CONFIG;
    private isInitialized: boolean = false;
    private hasPermissions: boolean = false;
    private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

    private constructor() { }

    public static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    /**
     * Initialize the notification manager
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Request permissions
            await this.requestPermissions();

            // Set up notification categories
            await this.setupNotificationCategories();

            this.isInitialized = true;
            console.log('NotificationManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize NotificationManager:', error);
            throw error;
        }
    }

    /**
     * Request notification permissions
     */
    public async requestPermissions(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            this.hasPermissions = finalStatus === 'granted';

            if (!this.hasPermissions) {
                console.warn('Notification permissions not granted');
                return false;
            }

            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('loop-execution', {
                    name: 'Loop Execution',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default',
                    enableVibrate: true,
                });

                await Notifications.setNotificationChannelAsync('background-execution', {
                    name: 'Background Execution',
                    importance: Notifications.AndroidImportance.LOW,
                    vibrationPattern: [0, 100],
                    sound: null,
                    enableVibrate: false,
                });
            }

            console.log('Notification permissions granted');
            return true;
        } catch (error) {
            console.error('Failed to request notification permissions:', error);
            this.hasPermissions = false;
            return false;
        }
    }

    /**
     * Set up notification categories and actions
     */
    private async setupNotificationCategories(): Promise<void> {
        try {
            await Notifications.setNotificationCategoryAsync('loop-execution', [
                {
                    identifier: 'pause',
                    buttonTitle: 'Pause',
                    options: {
                        opensAppToForeground: false,
                    },
                },
                {
                    identifier: 'stop',
                    buttonTitle: 'Stop',
                    options: {
                        opensAppToForeground: false,
                        isDestructive: true,
                    },
                },
            ]);

            await Notifications.setNotificationCategoryAsync('activity-complete', [
                {
                    identifier: 'next',
                    buttonTitle: 'Next Activity',
                    options: {
                        opensAppToForeground: false,
                    },
                },
                {
                    identifier: 'skip',
                    buttonTitle: 'Skip',
                    options: {
                        opensAppToForeground: false,
                    },
                },
            ]);

            console.log('Notification categories set up');
        } catch (error) {
            console.error('Failed to setup notification categories:', error);
        }
    }

    /**
     * Update notification configuration
     */
    public updateConfig(newConfig: Partial<NotificationConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('Notification config updated:', this.config);
    }

    /**
     * Get current configuration
     */
    public getConfig(): NotificationConfig {
        return { ...this.config };
    }

    /**
     * Show activity start notification
     */
    public async notifyActivityStart(activity: Activity, loop: Loop): Promise<void> {
        if (!this.shouldShowNotification('showActivityStart')) return;

        try {
            const notification = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Starting: ${activity.title}`,
                    body: activity.description || `Time to begin ${activity.title}`,
                    data: {
                        type: 'activity_start',
                        activityId: activity.id,
                        loopId: loop.id,
                    },
                    categoryIdentifier: 'loop-execution',
                    sound: this.config.playSound ? 'default' : undefined,
                },
                trigger: null, // Show immediately
            });

            console.log('Activity start notification shown:', activity.title);
        } catch (error) {
            console.error('Failed to show activity start notification:', error);
        }
    }

    /**
     * Show activity completion notification
     */
    public async notifyActivityComplete(activity: Activity, loop: Loop, isLastActivity: boolean = false): Promise<void> {
        if (!this.shouldShowNotification('showActivityComplete')) return;

        try {
            const title = isLastActivity ? 'Loop Complete!' : `Completed: ${activity.title}`;
            const body = isLastActivity
                ? `You've completed the ${loop.title} loop!`
                : `Great job! ${activity.title} is complete.`;

            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data: {
                        type: 'activity_complete',
                        activityId: activity.id,
                        loopId: loop.id,
                        isLastActivity,
                    },
                    categoryIdentifier: isLastActivity ? 'loop-execution' : 'activity-complete',
                    sound: this.config.playSound ? 'default' : undefined,
                },
                trigger: null, // Show immediately
            });

            console.log('Activity completion notification shown:', activity.title);
        } catch (error) {
            console.error('Failed to show activity completion notification:', error);
        }
    }

    /**
     * Show loop completion notification
     */
    public async notifyLoopComplete(loop: Loop, execution: ExecutionState): Promise<void> {
        if (!this.shouldShowNotification('showLoopComplete')) return;

        try {
            const completedActivities = execution.activities.filter(a => a.status === 'completed').length;
            const totalActivities = execution.activities.length;
            const completionRate = Math.round((completedActivities / totalActivities) * 100);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🎉 Loop Complete!',
                    body: `${loop.title} finished with ${completionRate}% completion rate`,
                    data: {
                        type: 'loop_complete',
                        loopId: loop.id,
                        executionId: execution.id,
                        completionRate,
                    },
                    categoryIdentifier: 'loop-execution',
                    sound: this.config.playSound ? 'default' : undefined,
                },
                trigger: null, // Show immediately
            });

            console.log('Loop completion notification shown:', loop.title);
        } catch (error) {
            console.error('Failed to show loop completion notification:', error);
        }
    }

    /**
     * Show background execution notification
     */
    public async notifyBackgroundExecution(loop: Loop, currentActivity: Activity): Promise<string | null> {
        if (!this.shouldShowNotification('showBackgroundExecution')) return null;

        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `${loop.title} running in background`,
                    body: `Current: ${currentActivity.title}`,
                    data: {
                        type: 'background_execution',
                        loopId: loop.id,
                        activityId: currentActivity.id,
                    },
                    categoryIdentifier: 'loop-execution',
                    sound: false, // No sound for background notifications
                    sticky: true, // Keep notification visible
                },
                trigger: null, // Show immediately
            });

            console.log('Background execution notification shown');
            return notificationId;
        } catch (error) {
            console.error('Failed to show background execution notification:', error);
            return null;
        }
    }

    /**
     * Schedule activity reminder notification
     */
    public async scheduleActivityReminder(
        activity: Activity,
        loop: Loop,
        triggerAt: Date
    ): Promise<string | null> {
        if (!this.shouldShowNotification('showActivityStart')) return null;

        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Upcoming: ${activity.title}`,
                    body: `${activity.title} starts in a few minutes`,
                    data: {
                        type: 'activity_reminder',
                        activityId: activity.id,
                        loopId: loop.id,
                    },
                    categoryIdentifier: 'loop-execution',
                    sound: this.config.playSound ? 'default' : undefined,
                },
                trigger: {
                    date: triggerAt,
                },
            });

            // Store scheduled notification
            const scheduledNotification: ScheduledNotification = {
                id: notificationId,
                type: 'activity_start',
                triggerAt,
                entityId: activity.id,
                content: {
                    title: `Upcoming: ${activity.title}`,
                    body: `${activity.title} starts in a few minutes`,
                    data: {
                        type: 'activity_reminder',
                        activityId: activity.id,
                        loopId: loop.id,
                    },
                },
            };

            this.scheduledNotifications.set(notificationId, scheduledNotification);
            console.log('Activity reminder scheduled:', activity.title, 'at', triggerAt);

            return notificationId;
        } catch (error) {
            console.error('Failed to schedule activity reminder:', error);
            return null;
        }
    }

    /**
     * Cancel a scheduled notification
     */
    public async cancelNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            this.scheduledNotifications.delete(notificationId);
            console.log('Notification cancelled:', notificationId);
        } catch (error) {
            console.error('Failed to cancel notification:', error);
        }
    }

    /**
     * Cancel all notifications for a specific loop
     */
    public async cancelLoopNotifications(loopId: string): Promise<void> {
        try {
            const notificationsToCancel = Array.from(this.scheduledNotifications.entries())
                .filter(([_, notification]) =>
                    notification.content.data?.loopId === loopId
                )
                .map(([id]) => id);

            await Promise.all(
                notificationsToCancel.map(id => this.cancelNotification(id))
            );

            console.log(`Cancelled ${notificationsToCancel.length} notifications for loop:`, loopId);
        } catch (error) {
            console.error('Failed to cancel loop notifications:', error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    public async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            this.scheduledNotifications.clear();
            console.log('All notifications cancelled');
        } catch (error) {
            console.error('Failed to cancel all notifications:', error);
        }
    }

    /**
     * Dismiss a displayed notification
     */
    public async dismissNotification(notificationId: string): Promise<void> {
        try {
            await Notifications.dismissNotificationAsync(notificationId);
            console.log('Notification dismissed:', notificationId);
        } catch (error) {
            console.error('Failed to dismiss notification:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    public async getScheduledNotifications(): Promise<ScheduledNotification[]> {
        return Array.from(this.scheduledNotifications.values());
    }

    /**
     * Check if notifications should be shown based on config
     */
    private shouldShowNotification(type: keyof NotificationConfig): boolean {
        return this.config.enabled && this.hasPermissions && this.config[type] === true;
    }

    /**
     * Handle notification response (when user taps notification)
     */
    public setupNotificationResponseHandler(
        handler: (response: Notifications.NotificationResponse) => void
    ): void {
        Notifications.addNotificationResponseReceivedListener(handler);
    }

    /**
     * Handle notification received while app is in foreground
     */
    public setupNotificationReceivedHandler(
        handler: (notification: Notifications.Notification) => void
    ): void {
        Notifications.addNotificationReceivedListener(handler);
    }

    /**
     * Get notification permission status
     */
    public async getPermissionStatus(): Promise<{
        granted: boolean;
        canAskAgain: boolean;
        status: string;
    }> {
        try {
            const { status, canAskAgain } = await Notifications.getPermissionsAsync();

            return {
                granted: status === 'granted',
                canAskAgain,
                status,
            };
        } catch (error) {
            console.error('Failed to get permission status:', error);
            return {
                granted: false,
                canAskAgain: true,
                status: 'unknown',
            };
        }
    }

    /**
     * Test notification functionality
     */
    public async testNotification(): Promise<void> {
        if (!this.hasPermissions) {
            console.warn('Cannot test notification - no permissions');
            return;
        }

        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Test Notification',
                    body: 'MindKnot notifications are working!',
                    data: { type: 'test' },
                },
                trigger: null,
            });

            console.log('Test notification sent');
        } catch (error) {
            console.error('Failed to send test notification:', error);
        }
    }
} 