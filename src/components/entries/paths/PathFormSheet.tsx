import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { Typography } from '../../common/Typography';
import { Icon } from '../../common/Icon';
import { FormSheet } from '../../common/FormSheet';
import {
    Form,
    FormInput,
    FormRichTextarea,
    FormDatePicker,
    FormArrayField,
    FormCategorySelector,
    FormTagInput
} from '../../form';
import { usePaths } from '../../../hooks/usePaths';
import { generateSimpleId } from '../../../utils/uuidUtil';
import { Path, Milestone } from '../../../types/path';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PathAction {
    id?: string;
    name: string;
    description?: string;
    dueDate?: Date;
    done?: boolean;
}

interface MilestoneForm {
    id?: string;
    name: string;
    description?: string;
    targetDate?: Date;
    actions: PathAction[];
}

interface PathFormValues {
    title: string;
    description: string;
    startDate?: Date;
    targetDate?: Date;
    milestones: MilestoneForm[];
    tags: string[];
    categoryId: string | null;
}

interface PathFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    pathToEdit?: Partial<PathFormValues> & { id?: string };
}

export default function PathFormSheet({
    visible,
    onClose,
    onSuccess,
    pathToEdit
}: PathFormSheetProps) {
    const { theme } = useTheme();
    const { addPath, updatePath } = usePaths();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!pathToEdit?.id;

    const styles = useStyles((theme) => ({
        formContainer: {
            width: '100%',
        },
        milestone: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        milestoneHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        action: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
    }));

    // Define specific bottom sheet properties to ensure visibility
    const bottomSheetProps = {
        maxHeight: 0.9,  // 90% of screen height
        minHeight: 600,  // Higher minimum height due to complex content
        snapPoints: [0.9, 0.5],  // Snap to 90% or 50% of screen height
    };

    const defaultValues: PathFormValues = {
        title: pathToEdit?.title || '',
        description: pathToEdit?.description || '',
        startDate: pathToEdit?.startDate,
        targetDate: pathToEdit?.targetDate,
        milestones: pathToEdit?.milestones || [],
        tags: pathToEdit?.tags || [],
        categoryId: pathToEdit?.categoryId || null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<PathFormValues>({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible, pathToEdit]);

    const handleFormSubmit = async (data: PathFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Convert Date objects to ISO strings
            const startDateString = data.startDate ? data.startDate.toISOString() : undefined;
            const targetDateString = data.targetDate ? data.targetDate.toISOString() : undefined;

            // Format milestones with proper types for the API
            const formattedMilestones = data.milestones.map((milestone) => ({
                id: milestone.id || generateSimpleId(),
                pathId: pathToEdit?.id || 'temp', // Will be set by the service for new milestones
                title: milestone.name,
                description: milestone.description,
                targetDate: milestone.targetDate ? milestone.targetDate.toISOString() : undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                actions: milestone.actions.map((action) => ({
                    id: action.id || generateSimpleId(),
                    name: action.name,
                    description: action.description,
                    dueDate: action.dueDate ? action.dueDate.toISOString() : undefined,
                    done: action.done || false
                }))
            }));

            // Create the path data object with the required type field
            const pathData: Omit<Path, 'id' | 'createdAt' | 'updatedAt'> = {
                type: 'path',
                title: data.title,
                description: data.description,
                startDate: startDateString,
                targetDate: targetDateString,
                milestones: formattedMilestones,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (isEditMode && pathToEdit?.id) {
                success = await updatePath(pathToEdit.id, pathData);
            } else {
                success = await addPath(pathData);
            }

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the path. Please try again.');
            }
        } catch (error) {
            console.error('Error handling path:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAction = (
        action: any,
        milestoneIndex: number,
        actionIndex: number,
        removeAction: (index: number) => void
    ) => {
        return (
            <View style={styles.action}>
                <View style={styles.actionHeader}>
                    <Typography variant="h4">Action {actionIndex + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => removeAction(actionIndex)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.name`}
                    control={control as unknown as Control<FieldValues>}
                    label="Name"
                    placeholder="Action name"
                    rules={{ required: 'Name is required' }}
                />

                <FormRichTextarea
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.description`}
                    control={control as unknown as Control<FieldValues>}
                    label="Description (optional)"
                    placeholder="Describe this action..."
                    numberOfLines={3}
                    editorMode="full"
                    resizable={true}
                    maxHeight={300}
                />

                <FormDatePicker
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.dueDate`}
                    control={control as unknown as Control<FieldValues>}
                    label="Due Date (optional)"
                />
            </View>
        );
    };

    const renderMilestone = (milestone: any, index: number, remove: (index: number) => void) => {
        const renderActionsArray = (item: any, actionIndex: number, removeAction: (index: number) => void) => {
            return renderAction(item, index, actionIndex, removeAction);
        };

        return (
            <View style={styles.milestone}>
                <View style={styles.milestoneHeader}>
                    <Typography variant="h3">Milestone {index + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => remove(index)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`milestones.${index}.name`}
                    control={control as unknown as Control<FieldValues>}
                    label="Name"
                    placeholder="Milestone name"
                    rules={{ required: 'Name is required' }}
                />

                <FormRichTextarea
                    name={`milestones.${index}.description`}
                    control={control as unknown as Control<FieldValues>}
                    label="Description (optional)"
                    placeholder="Describe this milestone..."
                    numberOfLines={3}
                    editorMode="full"
                    resizable={true}
                    maxHeight={300}
                />

                <FormDatePicker
                    name={`milestones.${index}.targetDate`}
                    control={control as unknown as Control<FieldValues>}
                    label="Target Date (optional)"
                />

                <FormArrayField
                    name={`milestones.${index}.actions`}
                    control={control as unknown as Control<FieldValues>}
                    label="Actions"
                    renderItem={(item, actionIndex, removeAction) =>
                        renderActionsArray(item, actionIndex, removeAction)
                    }
                    addButtonLabel="Add Action"
                    defaultItem={{
                        id: generateSimpleId(),
                        name: '',
                        description: '',
                        done: false
                    }}
                />
            </View>
        );
    };

    if (!visible) return null;

    return (
        <FormSheet
            visible={visible}
            onClose={onClose}
            title={isEditMode ? "Edit Path" : "Create Path"}
            onSubmit={handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
            isEdit={isEditMode}
            submitLabel={isEditMode ? "Update" : "Create"}
            bottomSheetProps={bottomSheetProps}
        >
            <View style={styles.formContainer}>
                <Form>
                    <FormInput
                        name="title"
                        control={control as unknown as Control<FieldValues>}
                        label="Title"
                        placeholder="Enter a title..."
                        rules={{ required: 'Title is required' }}
                    />

                    <FormRichTextarea
                        name="description"
                        control={control as unknown as Control<FieldValues>}
                        label="Description"
                        placeholder="Describe the path..."
                        rules={{ required: 'Description is required' }}
                        numberOfLines={3}
                        editorMode="full"
                        resizable={true}
                        maxHeight={300}
                    />

                    <FormDatePicker
                        name="startDate"
                        control={control as unknown as Control<FieldValues>}
                        label="Start Date (optional)"
                    />

                    <FormDatePicker
                        name="targetDate"
                        control={control as unknown as Control<FieldValues>}
                        label="Target Date (optional)"
                    />

                    <FormCategorySelector
                        name="categoryId"
                        control={control as unknown as Control<FieldValues>}
                        label="Category (optional)"
                    />

                    <FormTagInput
                        name="tags"
                        control={control as unknown as Control<FieldValues>}
                        label="Tags (optional)"
                    />

                    <FormArrayField
                        name="milestones"
                        control={control as unknown as Control<FieldValues>}
                        label="Milestones"
                        renderItem={renderMilestone}
                        addButtonLabel="Add Milestone"
                        defaultItem={{
                            id: generateSimpleId(),
                            name: '',
                            description: '',
                            actions: []
                        }}
                    />
                </Form>
            </View>
        </FormSheet>
    );
} 