import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    FormInput,
    FormTextarea,
    FormSelect,
    FormSwitch,
    Card
} from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';
import { Activity, ActivityType } from '../../../shared/types/loop';

export interface ActivityBuilderProps extends StyleProps {
    /**
     * Activity to edit (undefined for new activity)
     */
    activity?: Activity;

    /**
     * Callback when activity is saved
     */
    onSave: (activity: Omit<Activity, 'id'>) => void;

    /**
     * Callback when editing is cancelled
     */
    onCancel: () => void;

    /**
     * Whether the form is in loading state
     */
    isLoading?: boolean;
}

interface ActivityFormData {
    title: string;
    description: string;
    type: ActivityType;
    duration: number;
    isOptional: boolean;
    instructions: string;
    tags: string;
}

/**
 * ActivityBuilder component for creating and editing loop activities
 * 
 * @example
 * ```tsx
 * <ActivityBuilder
 *   activity={existingActivity}
 *   onSave={handleSaveActivity}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const ActivityBuilder: React.FC<ActivityBuilderProps> = ({
    activity,
    onSave,
    onCancel,
    isLoading = false,
    style,
}) => {
    const [selectedType, setSelectedType] = useState<ActivityType>(
        activity?.type || 'focus'
    );

    const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<ActivityFormData>({
        defaultValues: {
            title: activity?.title || '',
            description: activity?.description || '',
            type: activity?.type || 'focus',
            duration: activity?.duration || 300, // 5 minutes default
            isOptional: activity?.isOptional || false,
            instructions: activity?.instructions || '',
            tags: activity?.tags?.join(', ') || '',
        },
        mode: 'onChange',
    });

    const watchedType = watch('type');

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
        durationContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        durationInput: {
            flex: 1,
        },
        durationUnit: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        typeDescription: {
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
    }));

    const activityTypeOptions = [
        { label: 'Focus Work', value: 'focus' },
        { label: 'Break', value: 'break' },
        { label: 'Exercise', value: 'exercise' },
        { label: 'Meditation', value: 'meditation' },
        { label: 'Reading', value: 'reading' },
        { label: 'Custom', value: 'custom' },
    ];

    const getTypeDescription = (type: ActivityType): string => {
        const descriptions = {
            focus: 'Concentrated work or study session',
            break: 'Rest period or mental break',
            exercise: 'Physical activity or movement',
            meditation: 'Mindfulness or breathing exercise',
            reading: 'Reading or learning activity',
            custom: 'Custom activity type',
        };
        return descriptions[type] || '';
    };

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

    const onSubmit = (data: ActivityFormData) => {
        const activityData: Omit<Activity, 'id'> = {
            title: data.title.trim(),
            description: data.description.trim(),
            type: data.type,
            duration: data.duration,
            isOptional: data.isOptional,
            instructions: data.instructions.trim(),
            tags: data.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0),
        };

        onSave(activityData);
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
                        label="Activity Title"
                        placeholder="Enter activity title"
                        rules={{ required: 'Title is required' }}
                    />

                    <FormTextarea
                        name="description"
                        control={control}
                        label="Description"
                        placeholder="Describe this activity"
                        numberOfLines={3}
                    />
                </Card>

                {/* Activity Type */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Activity Type
                    </Typography>

                    <FormSelect
                        name="type"
                        control={control}
                        label="Type"
                        options={activityTypeOptions}
                        rules={{ required: 'Type is required' }}
                    />

                    <Typography style={styles.typeDescription}>
                        {getTypeDescription(watchedType)}
                    </Typography>
                </Card>

                {/* Duration & Settings */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Duration & Settings
                    </Typography>

                    <View style={styles.durationContainer}>
                        <View style={styles.durationInput}>
                            <FormInput
                                name="duration"
                                control={control}
                                label="Duration (seconds)"
                                placeholder="300"
                                keyboardType="numeric"
                                rules={{
                                    required: 'Duration is required',
                                    min: { value: 1, message: 'Duration must be at least 1 second' },
                                    max: { value: 7200, message: 'Duration cannot exceed 2 hours' }
                                }}
                            />
                        </View>
                        <Typography style={styles.durationUnit}>
                            {formatDuration(watch('duration') || 0)}
                        </Typography>
                    </View>

                    <FormSwitch
                        name="isOptional"
                        control={control}
                        label="Optional Activity"
                        helperText="Optional activities can be skipped during execution"
                    />
                </Card>

                {/* Instructions */}
                <Card style={styles.section}>
                    <Typography variant="h4" style={styles.sectionTitle}>
                        Instructions
                    </Typography>

                    <FormTextarea
                        name="instructions"
                        control={control}
                        label="Detailed Instructions"
                        placeholder="Provide specific instructions for this activity"
                        numberOfLines={4}
                    />

                    <FormInput
                        name="tags"
                        control={control}
                        label="Tags"
                        placeholder="focus, productivity, morning (comma-separated)"
                        helperText="Add tags to help organize and filter activities"
                    />
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
                    label={activity ? "Update Activity" : "Create Activity"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    isLoading={isLoading}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
}; 