// src/components/actions/ActionFormSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { BottomSheet } from '../../common/BottomSheet';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { Typography } from '../../common/Typography';
import { Button } from '../../common/Button';
import { Icon } from '../../common/Icon';
import {
    Form,
    FormInput,
    FormTextarea,
    FormDatePicker,
    FormCheckbox,
    FormArrayField,
    FormTagInput,
    FormCategorySelector
} from '../../form';
import { createAction } from '../../../services/actionService';
import { generateSimpleId } from '../../../utils/uuidUtil';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ActionFormSheetProps {
    visible: boolean;
    onClose: () => void;
    parentId?: string;
    parentType?: 'path' | 'milestone' | 'loop-item';
    onSuccess?: () => void;
}

export default function ActionFormSheet({
    visible,
    onClose,
    parentId,
    parentType,
    onSuccess,
}: ActionFormSheetProps) {
    const { theme } = useTheme();
    const { showCategoryForm } = useBottomSheet();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
            paddingTop: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.xl * 2,
            maxHeight: SCREEN_HEIGHT * 0.8,
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        closeButton: {
            padding: theme.spacing.s,
        },
        formContainer: {
            padding: theme.spacing.m,
        },
        buttonContainer: {
            marginTop: theme.spacing.l,
            paddingBottom: 100,
        },
        subAction: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
        },
        subActionContent: {
            flex: 1,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        fixedButtonContainer: {
            paddingVertical: theme.spacing.m,
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
            paddingHorizontal: theme.spacing.m,
            width: '100%',
        },
    }));

    const defaultValues = {
        title: '',
        body: '',
        done: false,
        dueDate: undefined,
        subActions: [],
        tags: [],
        categoryId: null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible]);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const success = await createAction({
                title: data.title,
                body: data.body,
                done: data.done,
                dueDate: data.dueDate,
                tags: data.tags,
                categoryId: data.categoryId,
                parentId,
                parentType,
                subActions: data.subActions?.map((action: any) => ({
                    ...action,
                    id: action.id || generateSimpleId(),
                    done: false,
                })),
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the action. Please try again.');
            }
        } catch (error) {
            console.error('Error creating action:', error);
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
                        name={`subActions.${index}.text` as any}
                        control={control}
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

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleCreateCategory = () => {
        // We need to close the current sheet first to avoid UI issues
        onClose();
        // Then show the category form
        setTimeout(() => {
            showCategoryForm(undefined, () => {
                // Re-open the action form after creating a category
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                }, 100);
            });
        }, 300);
    };

    if (!visible) return null;

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ width: '100%' }}
                >
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Typography variant="h3">Create Action</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ width: '100%', maxHeight: SCREEN_HEIGHT * 0.65 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Form>
                                <FormInput
                                    name="title"
                                    control={control}
                                    label="Title"
                                    placeholder="Enter a title..."
                                    rules={{ required: 'Title is required' }}
                                />

                                <FormTextarea
                                    name="body"
                                    control={control}
                                    label="Action Details"
                                    placeholder="Describe the action..."
                                    rules={{ required: 'Action description is required' }}
                                    numberOfLines={3}
                                />

                                <FormDatePicker
                                    name="dueDate"
                                    control={control}
                                    label="Due Date (optional)"
                                    placeholder="Select a due date"
                                />

                                <FormCheckbox
                                    name="done"
                                    control={control}
                                    label="Complete"
                                />

                                <FormArrayField
                                    name="subActions"
                                    control={control}
                                    label="Sub-Actions"
                                    renderItem={renderSubAction}
                                    addButtonLabel="Add Sub-Action"
                                    defaultValue={{ text: '', done: false }}
                                />

                                <FormCategorySelector
                                    name="categoryId"
                                    control={control}
                                    onCreateCategory={handleCreateCategory}
                                />

                                <FormTagInput
                                    name="tags"
                                    control={control}
                                    label="Tags"
                                    placeholder="Add a tag..."
                                    helperText="Press Enter or tap + to add a tag"
                                />

                                <View style={styles.buttonContainer}>
                                    <Button
                                        label={isSubmitting ? "Saving..." : "Save Action"}
                                        variant="primary"
                                        onPress={handleSubmit(handleFormSubmit)}
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting}
                                    />
                                </View>
                            </Form>
                        </ScrollView>
                        {/* Fixed button at the bottom */}
                        <View style={styles.fixedButtonContainer}>
                            <Button
                                label={isSubmitting ? "Saving..." : "Save Action"}
                                variant="primary"
                                onPress={handleSubmit(handleFormSubmit)}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                fullWidth
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}