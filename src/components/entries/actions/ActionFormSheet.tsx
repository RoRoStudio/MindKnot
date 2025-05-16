// src/components/actions/ActionFormSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Keyboard,
    TouchableOpacity,
    Platform,
    Dimensions,
    Alert,
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
    FormCheckbox,
    FormArrayField,
    FormTagInput,
    FormCategorySelector
} from '../../form';
import { createAction, updateAction } from '../../../services/actionService';
import { generateSimpleId } from '../../../utils/uuidUtil';
import { Action, SubAction } from '../../../types/action';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the shape of form values
interface ActionFormValues {
    title: string;
    body: string;
    done: boolean;
    dueDate?: Date;
    subActions: Array<{ id?: string; text: string; done: boolean }>;
    tags: string[];
    categoryId: string | null;
}

interface ActionFormSheetProps {
    visible: boolean;
    onClose: () => void;
    parentId?: string;
    parentType?: 'path' | 'milestone' | 'loop-item';
    onSuccess?: () => void;
    actionToEdit?: Partial<ActionFormValues> & { id?: string };
}

export default function ActionFormSheet({
    visible,
    onClose,
    parentId,
    parentType,
    onSuccess,
    actionToEdit,
}: ActionFormSheetProps) {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!actionToEdit;

    const styles = useStyles((theme) => ({
        subAction: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.xs,
        },
        subActionContent: {
            flex: 1,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        formContainer: {
            width: '100%',
        },
    }));

    // Define specific bottom sheet properties to ensure visibility
    const bottomSheetProps = {
        maxHeight: 0.85, // 85% of screen height
        minHeight: 450,  // Minimum height to ensure content is visible
        snapPoints: [0.85, 0.5], // Snap to 85% or 50% of screen height
    };

    const defaultValues: ActionFormValues = {
        title: actionToEdit?.title || '',
        body: actionToEdit?.body || '',
        done: actionToEdit?.done || false,
        dueDate: actionToEdit?.dueDate,
        subActions: actionToEdit?.subActions || [],
        tags: actionToEdit?.tags || [],
        categoryId: actionToEdit?.categoryId || null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<ActionFormValues>({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible, actionToEdit]);

    const handleFormSubmit = async (data: ActionFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Convert Date to ISO string for API
            const dueDateString = data.dueDate ? data.dueDate.toISOString() : undefined;

            const actionData = {
                title: data.title,
                body: data.body,
                done: data.done,
                dueDate: dueDateString,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                parentId,
                parentType,
                subActions: data.subActions?.map((action) => ({
                    ...action,
                    id: action.id || generateSimpleId(),
                    done: action.done || false,
                })),
            };

            let success;
            if (isEditMode && actionToEdit?.id) {
                success = await updateAction(actionToEdit.id, actionData);
            } else {
                await createAction(actionData);
                success = true;
            }

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the action. Please try again.');
            }
        } catch (error) {
            console.error('Error handling action:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSubAction = (item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={styles.subAction}>
                <View style={styles.subActionContent}>
                    <FormInput
                        name={`subActions.${index}.text`}
                        control={control as unknown as Control<FieldValues>}
                        placeholder="Sub-action"
                        rules={{ required: 'Sub-action text is required' }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => remove(index)}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Icon name="minus" width={16} height={16} color="red" />
                </TouchableOpacity>
            </View>
        );
    };

    if (!visible) return null;

    return (
        <FormSheet
            visible={visible}
            onClose={onClose}
            title={isEditMode ? "Edit Action" : "Create Action"}
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
                        name="body"
                        control={control as unknown as Control<FieldValues>}
                        label="Action Details"
                        placeholder="Describe the action..."
                        rules={{ required: 'Action description is required' }}
                        numberOfLines={3}
                        editorMode="optional"
                        resizable={true}
                        maxHeight={300}
                    />

                    <FormDatePicker
                        name="dueDate"
                        control={control as unknown as Control<FieldValues>}
                        label="Due Date (Optional)"
                    />

                    <FormCheckbox
                        name="done"
                        control={control as unknown as Control<FieldValues>}
                        label="Completed"
                    />

                    <FormArrayField
                        name="subActions"
                        control={control as unknown as Control<FieldValues>}
                        label="Sub-actions"
                        renderItem={renderSubAction}
                        addButtonLabel="Add Sub-action"
                        defaultValue={{ text: '', done: false }}
                    />

                    <FormTagInput
                        name="tags"
                        control={control as unknown as Control<FieldValues>}
                        label="Tags"
                    />

                    <FormCategorySelector
                        name="categoryId"
                        control={control as unknown as Control<FieldValues>}
                        label="Category"
                    />
                </Form>
            </View>
        </FormSheet>
    );
}