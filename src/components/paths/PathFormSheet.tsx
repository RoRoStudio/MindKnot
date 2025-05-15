// src/components/paths/PathFormSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    Alert,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Keyboard,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { BottomSheet } from '../../components/common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Icon, IconName } from '../common/Icon';
import {
    Form,
    FormInput,
    FormTextarea,
    FormDatePicker,
    FormSelect,
    FormArrayField,
    FormCategorySelector,
    FormTagInput
} from '../form';
import { useSagas } from '../../hooks/useSagas';
import { usePaths } from '../../hooks/usePaths';
import { generateSimpleId } from '../../utils/uuidUtil';
import { useBottomSheet } from '../../contexts/BottomSheetContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PathFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function PathFormSheet({
    visible,
    onClose,
    initialSagaId,
    onSuccess
}: PathFormSheetProps) {
    const { theme } = useTheme();
    const { sagas } = useSagas();
    const { addPath } = usePaths();
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
        milestone: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
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
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginTop: theme.spacing.s,
        },
        actionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        buttonContainer: {
            marginTop: theme.spacing.l,
            paddingBottom: 100,
        },
    }));

    // Setup saga options
    const sagaOptions = sagas.map(saga => ({
        label: saga.name,
        value: saga.id,
        icon: saga.icon
    }));

    // Add an empty option with an empty string icon instead of undefined
    sagaOptions.unshift({ label: 'None', value: '', icon: '' as IconName });

    const defaultValues = {
        title: '',
        description: '',
        startDate: undefined,
        targetDate: undefined,
        sagaId: initialSagaId || '',
        milestones: [],
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
            reset({
                ...defaultValues,
                sagaId: initialSagaId || ''
            });
            setIsSubmitting(false);
        }
    }, [visible, initialSagaId]);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const success = await addPath({
                ...data,
                milestones: data.milestones?.map((milestone: any) => ({
                    ...milestone,
                    id: milestone.id || generateSimpleId(),
                    actions: milestone.actions?.map((action: any) => ({
                        ...action,
                        id: action.id || generateSimpleId(),
                    })) || [],
                })),
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the path. Please try again.');
            }
        } catch (error) {
            console.error('Error creating path:', error);
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
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.name` as any}
                    control={control}
                    label="Name"
                    placeholder="Action name"
                    rules={{ required: 'Name is required' }}
                />

                <FormTextarea
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.description` as any}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this action..."
                    numberOfLines={3}
                />

                <FormDatePicker
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.dueDate` as any}
                    control={control}
                    label="Due Date (optional)"
                    placeholder="Select a due date"
                />

                <FormSelect
                    name={`milestones.${milestoneIndex}.actions.${actionIndex}.sagaId` as any}
                    control={control}
                    label="Link to Saga (optional)"
                    options={sagaOptions}
                    placeholder="Select a saga"
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
                    name={`milestones.${index}.title` as any}
                    control={control}
                    label="Title"
                    placeholder="Milestone title"
                    rules={{ required: 'Title is required' }}
                />

                <FormTextarea
                    name={`milestones.${index}.description` as any}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this milestone..."
                    numberOfLines={3}
                />

                <FormArrayField
                    name={`milestones.${index}.actions` as any}
                    control={control}
                    label="Actions"
                    renderItem={renderActionsArray}
                    addButtonLabel="Add Action"
                    defaultValue={{ name: '', description: '', done: false }}
                />
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
                // Re-open the path form after creating a category
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
                            <Typography variant="h3">Create Path</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                disabled={isSubmitting}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={{ width: '100%' }}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            <Form>
                                <FormSelect
                                    name="sagaId"
                                    control={control}
                                    label="Link to Saga (optional)"
                                    options={sagaOptions}
                                    placeholder="Select a saga"
                                />

                                <FormInput
                                    name="title"
                                    control={control}
                                    label="Path Title"
                                    placeholder="E.g. Learn React Native"
                                    rules={{ required: 'Title is required' }}
                                />

                                <FormTextarea
                                    name="description"
                                    control={control}
                                    label="Description (optional)"
                                    placeholder="Describe this path..."
                                    numberOfLines={3}
                                />

                                <FormDatePicker
                                    name="startDate"
                                    control={control}
                                    label="Start Date (optional)"
                                    placeholder="Select a start date"
                                />

                                <FormDatePicker
                                    name="targetDate"
                                    control={control}
                                    label="Target Date (optional)"
                                    placeholder="Select a target date"
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

                                <FormArrayField
                                    name="milestones"
                                    control={control}
                                    label="Milestones"
                                    renderItem={renderMilestone}
                                    addButtonLabel="Add Milestone"
                                    defaultValue={{ title: '', description: '', actions: [] }}
                                />

                                <View style={styles.buttonContainer}>
                                    <Button
                                        label={isSubmitting ? "Saving..." : "Save Path"}
                                        variant="primary"
                                        onPress={handleSubmit(handleFormSubmit)}
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting}
                                    />
                                </View>
                            </Form>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
}