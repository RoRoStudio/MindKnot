import React from 'react';
import { View, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    FormInput,
    FormSelect,
    FormSwitch,
    Card
} from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';
import { Loop } from '../../../shared/types/loop';

export interface LoopSettingsProps extends StyleProps {
    /**
     * Loop to configure settings for
     */
    loop: Loop;

    /**
     * Callback when settings are saved
     */
    onSave: (settings: Partial<Loop>) => void;

    /**
     * Callback when editing is cancelled
     */
    onCancel: () => void;

    /**
     * Whether the form is in loading state
     */
    isLoading?: boolean;
}

interface LoopSettingsFormData {
    title: string;
    description: string;
    category: string;
    tags: string;
    isRepeatable: boolean;
    maxIterations: number;
    breakBetweenIterations: number;
    autoStart: boolean;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    backgroundExecution: boolean;
}

/**
 * LoopSettings component for configuring loop execution settings
 * 
 * @example
 * ```tsx
 * <LoopSettings
 *   loop={currentLoop}
 *   onSave={handleSaveSettings}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const LoopSettings: React.FC<LoopSettingsProps> = ({
    loop,
    onSave,
    onCancel,
    isLoading = false,
    style,
}) => {
    const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<LoopSettingsFormData>({
        defaultValues: {
            title: loop.title,
            description: loop.description,
            category: loop.category || '',
            tags: loop.tags?.join(', ') || '',
            isRepeatable: loop.isRepeatable || false,
            maxIterations: loop.maxIterations || 1,
            breakBetweenIterations: loop.breakBetweenIterations || 0,
            autoStart: loop.autoStart || false,
            notificationsEnabled: loop.notificationsEnabled !== false,
            soundEnabled: loop.soundEnabled !== false,
            vibrationEnabled: loop.vibrationEnabled !== false,
            backgroundExecution: loop.backgroundExecution !== false,
        },
        mode: 'onChange',
    });

    const watchedIsRepeatable = watch('isRepeatable');
    const watchedNotifications = watch('notificationsEnabled');

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            padding: theme.spacing.m,
        },
        scrollContainer: {
            flex: 1,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.s,
        },
        formRow: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        formColumn: {
            flex: 1,
        },
        settingItem: {
            marginBottom: theme.spacing.m,
        },
        helperText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
            fontStyle: 'italic',
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            paddingTop: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        actionButton: {
            flex: 1,
        },
        disabledSection: {
            opacity: 0.5,
        },
    }));

    const categoryOptions = [
        { label: 'Productivity', value: 'productivity' },
        { label: 'Health & Fitness', value: 'health' },
        { label: 'Learning', value: 'learning' },
        { label: 'Mindfulness', value: 'mindfulness' },
        { label: 'Creative', value: 'creative' },
        { label: 'Personal', value: 'personal' },
        { label: 'Work', value: 'work' },
        { label: 'Other', value: 'other' },
    ];

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0 && remainingSeconds > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return `${remainingSeconds}s`;
        }
    };

    const onSubmit = (data: LoopSettingsFormData) => {
        const settings: Partial<Loop> = {
            title: data.title.trim(),
            description: data.description.trim(),
            category: data.category || undefined,
            tags: data.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0),
            isRepeatable: data.isRepeatable,
            maxIterations: data.isRepeatable ? data.maxIterations : 1,
            breakBetweenIterations: data.isRepeatable ? data.breakBetweenIterations : 0,
            autoStart: data.autoStart,
            notificationsEnabled: data.notificationsEnabled,
            soundEnabled: data.soundEnabled,
            vibrationEnabled: data.vibrationEnabled,
            backgroundExecution: data.backgroundExecution,
        };

        onSave(settings);
    };

    return (
        <View style={[styles.container, style]}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Basic Information */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Basic Information
                    </Typography>

                    <FormInput
                        name="title"
                        control={control}
                        label="Loop Title"
                        placeholder="Enter loop title"
                        rules={{ required: 'Title is required' }}
                    />

                    <FormInput
                        name="description"
                        control={control}
                        label="Description"
                        placeholder="Describe this loop"
                        multiline
                        numberOfLines={3}
                    />

                    <FormSelect
                        name="category"
                        control={control}
                        label="Category"
                        options={categoryOptions}
                        placeholder="Select a category"
                    />

                    <FormInput
                        name="tags"
                        control={control}
                        label="Tags"
                        placeholder="productivity, morning, focus (comma-separated)"
                        helperText="Add tags to help organize and filter loops"
                    />
                </Card>

                {/* Repetition Settings */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Repetition Settings
                    </Typography>

                    <View style={styles.settingItem}>
                        <FormSwitch
                            name="isRepeatable"
                            control={control}
                            label="Allow Repetition"
                            helperText="Enable this loop to be repeated multiple times"
                        />
                    </View>

                    <View style={[!watchedIsRepeatable && styles.disabledSection]}>
                        <FormInput
                            name="maxIterations"
                            control={control}
                            label="Maximum Iterations"
                            placeholder="1"
                            keyboardType="numeric"
                            disabled={!watchedIsRepeatable}
                            rules={{
                                min: { value: 1, message: 'Must be at least 1' },
                                max: { value: 100, message: 'Cannot exceed 100' }
                            }}
                        />

                        <FormInput
                            name="breakBetweenIterations"
                            control={control}
                            label="Break Between Iterations (seconds)"
                            placeholder="0"
                            keyboardType="numeric"
                            disabled={!watchedIsRepeatable}
                            helperText={`Break duration: ${formatDuration(watch('breakBetweenIterations') || 0)}`}
                            rules={{
                                min: { value: 0, message: 'Cannot be negative' },
                                max: { value: 3600, message: 'Cannot exceed 1 hour' }
                            }}
                        />
                    </View>
                </Card>

                {/* Execution Settings */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Execution Settings
                    </Typography>

                    <View style={styles.settingItem}>
                        <FormSwitch
                            name="autoStart"
                            control={control}
                            label="Auto-start Activities"
                            helperText="Automatically start the next activity without manual intervention"
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <FormSwitch
                            name="backgroundExecution"
                            control={control}
                            label="Background Execution"
                            helperText="Continue loop execution when app is in background"
                        />
                    </View>
                </Card>

                {/* Notification Settings */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Notification Settings
                    </Typography>

                    <View style={styles.settingItem}>
                        <FormSwitch
                            name="notificationsEnabled"
                            control={control}
                            label="Enable Notifications"
                            helperText="Receive notifications for activity transitions and completions"
                        />
                    </View>

                    <View style={[!watchedNotifications && styles.disabledSection]}>
                        <View style={styles.settingItem}>
                            <FormSwitch
                                name="soundEnabled"
                                control={control}
                                label="Sound Notifications"
                                disabled={!watchedNotifications}
                                helperText="Play sound for notifications"
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <FormSwitch
                                name="vibrationEnabled"
                                control={control}
                                label="Vibration"
                                disabled={!watchedNotifications}
                                helperText="Vibrate device for notifications"
                            />
                        </View>
                    </View>
                </Card>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Button
                    variant="secondary"
                    label="Cancel"
                    onPress={onCancel}
                    disabled={isLoading}
                    style={styles.actionButton}
                />
                <Button
                    variant="primary"
                    label="Save Settings"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    isLoading={isLoading}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
}; 