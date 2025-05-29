/**
 * LoopSettingsForm Component
 * Handles both notification and scheduling settings in bottom sheets
 * Comprehensive settings for robust loop features
 */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    FormSwitch,
    FormSelect,
    FormInput,
    FormMultiSelect,
} from '../../../shared/components';
import { NotificationSettings, ScheduleSettings } from '../../../shared/types/loop';

export interface LoopSettingsFormProps {
    /** Type of settings form */
    type: 'notifications' | 'scheduling';

    /** Current settings */
    settings: NotificationSettings | ScheduleSettings | undefined;

    /** Callback when settings are saved */
    onSave: (settings: NotificationSettings | ScheduleSettings) => void;

    /** Callback when cancelled */
    onCancel: () => void;
}

interface NotificationFormData {
    enabled: boolean;
    activityReminders: boolean;
    sessionProgress: boolean;
    completionCelebration: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    persistentOverlay: boolean;
}

interface SchedulingFormData {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    time: string;
    days: string[];
    reminderMinutes: number;
    autoStart: boolean;
}

const FREQUENCY_OPTIONS = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Custom', value: 'custom' },
];

const DAYS_OPTIONS = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
    { label: 'Tuesday', value: '2' },
    { label: 'Wednesday', value: '3' },
    { label: 'Thursday', value: '4' },
    { label: 'Friday', value: '5' },
    { label: 'Saturday', value: '6' },
];

const REMINDER_OPTIONS = [
    { label: 'No reminder', value: 0 },
    { label: '5 minutes before', value: 5 },
    { label: '10 minutes before', value: 10 },
    { label: '15 minutes before', value: 15 },
    { label: '30 minutes before', value: 30 },
    { label: '1 hour before', value: 60 },
];

/**
 * LoopSettingsForm for notification and scheduling configuration
 */
export const LoopSettingsForm: React.FC<LoopSettingsFormProps> = ({
    type,
    settings,
    onSave,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const styles = useThemedStyles((theme) => ({
        container: {
            padding: theme.spacing.m,
            maxHeight: '80%',
        },
        header: {
            marginBottom: theme.spacing.l,
            paddingBottom: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        title: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.xs,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.m,
        },
        settingItem: {
            marginBottom: theme.spacing.m,
        },
        timeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.m,
        },
        timeInput: {
            flex: 1,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            paddingTop: theme.spacing.l,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        actionButton: {
            flex: 1,
        },
        helperText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
            fontStyle: 'italic',
        },
        disabledSection: {
            opacity: 0.5,
        },
    }));

    // Notification form
    const notificationForm = useForm<NotificationFormData>({
        defaultValues: {
            enabled: (settings as NotificationSettings)?.enabled ?? true,
            activityReminders: (settings as NotificationSettings)?.activityReminders ?? true,
            sessionProgress: (settings as NotificationSettings)?.sessionProgress ?? true,
            completionCelebration: (settings as NotificationSettings)?.completionCelebration ?? true,
            soundEnabled: (settings as NotificationSettings)?.soundEnabled ?? true,
            vibrationEnabled: (settings as NotificationSettings)?.vibrationEnabled ?? true,
            persistentOverlay: (settings as NotificationSettings)?.persistentOverlay ?? true,
        },
        mode: 'onChange',
    });

    // Scheduling form
    const schedulingForm = useForm<SchedulingFormData>({
        defaultValues: {
            enabled: (settings as ScheduleSettings)?.enabled ?? false,
            frequency: (settings as ScheduleSettings)?.frequency ?? 'daily',
            time: (settings as ScheduleSettings)?.time ?? '09:00',
            days: (settings as ScheduleSettings)?.days?.map(String) ?? ['1', '2', '3', '4', '5'], // Weekdays
            reminderMinutes: (settings as ScheduleSettings)?.reminderMinutes ?? 10,
            autoStart: (settings as ScheduleSettings)?.autoStart ?? false,
        },
        mode: 'onChange',
    });

    const currentForm = type === 'notifications' ? notificationForm : schedulingForm;
    const watchedValues = currentForm.watch();
    const watchedEnabled = watchedValues.enabled;
    const watchedFrequency = type === 'scheduling' ? (watchedValues as SchedulingFormData).frequency : null;

    // Submit handler
    const onSubmit = async (data: NotificationFormData | SchedulingFormData) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            if (type === 'notifications') {
                const notificationSettings: NotificationSettings = data as NotificationFormData;
                onSave(notificationSettings);
            } else {
                const formData = data as SchedulingFormData;
                const scheduleSettings: ScheduleSettings = {
                    ...formData,
                    days: formData.days.map(Number), // Convert string[] back to number[]
                };
                onSave(scheduleSettings);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render notification settings
    const renderNotificationSettings = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Enable/Disable */}
            <View style={styles.section}>
                <FormSwitch
                    name="enabled"
                    control={notificationForm.control}
                    label="Enable Notifications"
                    helperText="Turn on notifications for loop activities"
                />
            </View>

            {/* Notification Types */}
            <View style={[styles.section, !watchedEnabled && styles.disabledSection]}>
                <Typography style={styles.sectionTitle}>
                    Notification Types
                </Typography>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="activityReminders"
                        control={notificationForm.control}
                        label="Activity Reminders"
                        helperText="Get notified when it's time for the next activity"
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="sessionProgress"
                        control={notificationForm.control}
                        label="Session Progress"
                        helperText="Show progress updates during loop execution"
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="completionCelebration"
                        control={notificationForm.control}
                        label="Completion Celebration"
                        helperText="Celebrate when you complete activities or loops"
                        disabled={!watchedEnabled}
                    />
                </View>
            </View>

            {/* Notification Style */}
            <View style={[styles.section, !watchedEnabled && styles.disabledSection]}>
                <Typography style={styles.sectionTitle}>
                    Notification Style
                </Typography>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="soundEnabled"
                        control={notificationForm.control}
                        label="Sound"
                        helperText="Play notification sounds"
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="vibrationEnabled"
                        control={notificationForm.control}
                        label="Vibration"
                        helperText="Vibrate for notifications"
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="persistentOverlay"
                        control={notificationForm.control}
                        label="Persistent Overlay"
                        helperText="Show persistent notification during execution"
                        disabled={!watchedEnabled}
                    />
                </View>
            </View>
        </ScrollView>
    );

    // Render scheduling settings
    const renderSchedulingSettings = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Enable/Disable */}
            <View style={styles.section}>
                <FormSwitch
                    name="enabled"
                    control={schedulingForm.control}
                    label="Enable Scheduling"
                    helperText="Schedule this loop to run automatically"
                />
            </View>

            {/* Schedule Configuration */}
            <View style={[styles.section, !watchedEnabled && styles.disabledSection]}>
                <Typography style={styles.sectionTitle}>
                    Schedule Configuration
                </Typography>

                <View style={styles.settingItem}>
                    <FormSelect
                        name="frequency"
                        control={schedulingForm.control}
                        label="Frequency"
                        options={FREQUENCY_OPTIONS}
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormInput
                        name="time"
                        control={schedulingForm.control}
                        label="Time"
                        placeholder="09:00"
                        helperText="Time in HH:MM format (24-hour)"
                        editable={watchedEnabled}
                        rules={{
                            pattern: {
                                value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
                                message: 'Please enter time in HH:MM format'
                            }
                        }}
                    />
                </View>

                {(watchedFrequency === 'weekly' || watchedFrequency === 'custom') && (
                    <View style={styles.settingItem}>
                        <FormMultiSelect
                            name="days"
                            control={schedulingForm.control}
                            options={DAYS_OPTIONS}
                            disabled={!watchedEnabled}
                            placeholder="Select which days to run the loop"
                        />
                    </View>
                )}
            </View>

            {/* Reminder Settings */}
            <View style={[styles.section, !watchedEnabled && styles.disabledSection]}>
                <Typography style={styles.sectionTitle}>
                    Reminder Settings
                </Typography>

                <View style={styles.settingItem}>
                    <FormSelect
                        name="reminderMinutes"
                        control={schedulingForm.control}
                        label="Reminder"
                        options={REMINDER_OPTIONS}
                        disabled={!watchedEnabled}
                    />
                </View>

                <View style={styles.settingItem}>
                    <FormSwitch
                        name="autoStart"
                        control={schedulingForm.control}
                        label="Auto-start"
                        helperText="Automatically start the loop at scheduled time"
                        disabled={!watchedEnabled}
                    />
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Typography style={styles.title}>
                    {type === 'notifications' ? 'Notification Settings' : 'Scheduling Settings'}
                </Typography>
                <Typography style={styles.subtitle}>
                    {type === 'notifications'
                        ? 'Configure how you want to be notified during loop execution'
                        : 'Set up automatic scheduling for this loop'
                    }
                </Typography>
            </View>

            {/* Content */}
            {type === 'notifications' ? renderNotificationSettings() : renderSchedulingSettings()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Button
                    variant="secondary"
                    label="Cancel"
                    onPress={onCancel}
                    disabled={isSubmitting}
                    style={styles.actionButton}
                />
                <Button
                    variant="primary"
                    label="Save Settings"
                    onPress={currentForm.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
}; 