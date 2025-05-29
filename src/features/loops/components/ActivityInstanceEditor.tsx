/**
 * ActivityInstanceEditor Component
 * Per-spec activity customization with all required fields
 * 
 * Features:
 * - Override title (optional, underlined input)
 * - Quantity editor with number + unit dropdown ("pages", "sets", "reps")
 * - Duration picker (minutes only, optional)
 * - Sub-items manager (add/remove/edit labels and checkboxes)
 * - Linked target selector ('notes' | 'sparks' | 'actions' | 'paths')
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useForm, useFieldArray } from 'react-hook-form';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    FormInput,
    FormSelect,
    FormSwitch,
    Button,
    Card,
    Icon,
} from '../../../shared/components';
import { ActivityInstance, ActivityTemplate } from '../../../shared/types/loop';

export interface ActivityInstanceEditorProps {
    /** Activity instance to edit */
    activityInstance: ActivityInstance;

    /** Template reference for defaults */
    template: ActivityTemplate;

    /** Callback when activity is updated */
    onUpdate: (activity: ActivityInstance) => void;

    /** Whether this is in a compact view */
    compact?: boolean;

    /** Callback when done editing (to close modal/bottomsheet) */
    onDone?: () => void;
}

interface FormData {
    title: string;
    hasQuantity: boolean;
    quantityNumber: string;
    quantityUnit: string;
    hasDuration: boolean;
    duration: string;
    linkedTarget: string;
    subItems: { label: string }[];
}

/**
 * ActivityInstanceEditor component for customizing activity instances
 */
export const ActivityInstanceEditor: React.FC<ActivityInstanceEditorProps> = ({
    activityInstance,
    template,
    onUpdate,
    compact = false,
    onDone,
}) => {
    const [isExpanded, setIsExpanded] = useState(!compact);

    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
        },
        headerContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        templateEmoji: {
            fontSize: 24,
            marginRight: theme.spacing.m,
        },
        headerText: {
            flex: 1,
        },
        templateTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        customTitle: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
        expandButton: {
            padding: theme.spacing.s,
        },
        editorContent: {
            marginTop: theme.spacing.s,
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.s,
        },
        quantityRow: {
            flexDirection: 'row',
            gap: theme.spacing.m,
        },
        quantityNumber: {
            flex: 1,
        },
        quantityUnit: {
            flex: 1,
        },
        subItemsContainer: {
            gap: theme.spacing.s,
        },
        subItemRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        subItemInput: {
            flex: 1,
        },
        removeButton: {
            padding: theme.spacing.s,
        },
        addButton: {
            marginTop: theme.spacing.s,
        },
        switchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.m,
        },
        switchLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
    }));

    // Form setup
    const { control, watch, setValue, handleSubmit } = useForm<FormData>({
        defaultValues: {
            title: activityInstance.title || '',
            hasQuantity: !!activityInstance.quantity,
            quantityNumber: activityInstance.quantity?.number.toString() || '1',
            quantityUnit: activityInstance.quantity?.unit || 'reps',
            hasDuration: !!activityInstance.duration,
            duration: activityInstance.duration?.toString() || '5',
            linkedTarget: activityInstance.linkedTarget || template.linkedTarget || '',
            subItems: activityInstance.subItems?.map(item => ({ label: item.label })) || [],
        },
    });

    const { fields: subItemFields, append: addSubItem, remove: removeSubItem } = useFieldArray({
        control,
        name: 'subItems',
    });

    const watchedValues = watch();

    // Quantity unit options
    const quantityUnits = [
        { label: 'Reps', value: 'reps' },
        { label: 'Sets', value: 'sets' },
        { label: 'Pages', value: 'pages' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Items', value: 'items' },
    ];

    // Linked target options
    const linkedTargetOptions = [
        { label: 'None', value: '' },
        { label: 'Notes', value: 'notes' },
        { label: 'Sparks', value: 'sparks' },
        { label: 'Actions', value: 'actions' },
        { label: 'Paths', value: 'paths' },
    ];

    // Handle form submission
    const onSubmit = (data: FormData) => {
        const updatedActivity: ActivityInstance = {
            ...activityInstance,
            title: data.title.trim() || undefined,
            quantity: data.hasQuantity ? {
                number: parseInt(data.quantityNumber) || 1,
                unit: data.quantityUnit,
            } : undefined,
            duration: data.hasDuration ? parseInt(data.duration) || undefined : undefined,
            linkedTarget: (data.linkedTarget as 'notes' | 'sparks' | 'actions' | 'paths') || undefined,
            subItems: data.subItems.length > 0 ? data.subItems.map(item => ({
                label: item.label.trim(),
                completed: false,
            })).filter(item => item.label) : undefined,
        };

        onUpdate(updatedActivity);
    };

    // Add new sub-item
    const handleAddSubItem = () => {
        addSubItem({ label: '' });
    };

    // Remove sub-item
    const handleRemoveSubItem = (index: number) => {
        if (subItemFields.length <= 1) {
            // If only one or no items, just clear the label instead of removing
            setValue(`subItems.${index}.label`, '');
            return;
        }
        removeSubItem(index);
    };

    const displayTitle = activityInstance.title || template.title;
    const hasCustomizations = !!(
        activityInstance.title ||
        activityInstance.quantity ||
        activityInstance.duration ||
        activityInstance.linkedTarget ||
        activityInstance.subItems?.length
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                disabled={!compact}
            >
                <View style={styles.headerContent}>
                    <Typography style={styles.templateEmoji}>
                        {template.emoji}
                    </Typography>
                    <View style={styles.headerText}>
                        <Typography style={styles.templateTitle}>
                            {displayTitle}
                        </Typography>
                        {activityInstance.title && (
                            <Typography style={styles.customTitle}>
                                Custom title
                            </Typography>
                        )}
                    </View>
                </View>

                {compact && (
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => setIsExpanded(!isExpanded)}
                    >
                        <Icon
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color={styles.templateTitle.color}
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Editor Content */}
            {isExpanded && (
                <Card style={styles.editorContent}>
                    {/* Custom Title */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Custom Title (Optional)
                        </Typography>
                        <FormInput
                            name="title"
                            control={control}
                            placeholder={template.title}
                            isTitle={true}
                        />
                    </View>

                    {/* Quantity */}
                    <View style={styles.section}>
                        <View style={styles.switchRow}>
                            <Typography style={styles.switchLabel}>
                                Set Quantity
                            </Typography>
                            <FormSwitch
                                name="hasQuantity"
                                control={control}
                                label="Set Quantity"
                            />
                        </View>

                        {watchedValues.hasQuantity && (
                            <View style={styles.quantityRow}>
                                <FormInput
                                    name="quantityNumber"
                                    control={control}
                                    placeholder="1"
                                    keyboardType="numeric"
                                    style={styles.quantityNumber}
                                />
                                <View style={styles.quantityUnit}>
                                    <FormSelect
                                        name="quantityUnit"
                                        control={control}
                                        options={quantityUnits}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Duration */}
                    <View style={styles.section}>
                        <View style={styles.switchRow}>
                            <Typography style={styles.switchLabel}>
                                Set Duration (minutes)
                            </Typography>
                            <FormSwitch
                                name="hasDuration"
                                control={control}
                                label="Set Duration"
                            />
                        </View>

                        {watchedValues.hasDuration && (
                            <FormInput
                                name="duration"
                                control={control}
                                placeholder="5"
                                keyboardType="numeric"
                            />
                        )}
                    </View>

                    {/* Linked Target */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Linked Target
                        </Typography>
                        <FormSelect
                            name="linkedTarget"
                            control={control}
                            options={linkedTargetOptions}
                        />
                    </View>

                    {/* Sub-items */}
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Sub-items Checklist
                        </Typography>

                        <View style={styles.subItemsContainer}>
                            {subItemFields.map((field, index) => (
                                <View key={field.id} style={styles.subItemRow}>
                                    <FormInput
                                        name={`subItems.${index}.label`}
                                        control={control}
                                        placeholder={`Sub-item ${index + 1}`}
                                        style={styles.subItemInput}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemoveSubItem(index)}
                                    >
                                        <Icon
                                            name="x"
                                            size={20}
                                            color={styles.templateTitle.color}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <Button
                            variant="outline"
                            label="Add Sub-item"
                            leftIcon="plus"
                            onPress={handleAddSubItem}
                            size="small"
                            style={styles.addButton}
                        />
                    </View>

                    {/* Done Button */}
                    <View style={styles.section}>
                        <Button
                            variant="primary"
                            label="Done"
                            onPress={() => {
                                handleSubmit(onSubmit)();
                                onDone?.();
                            }}
                            fullWidth
                        />
                    </View>
                </Card>
            )}
        </View>
    );
}; 