// src/components/captures/CaptureFormSheet.tsx
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
    Text,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { BottomSheet } from '../common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Icon, IconName } from '../common/Icon';
import {
    Form,
    FormInput,
    FormTextarea,
    FormSelect,
    FormDatePicker,
    FormCheckbox,
    FormMoodSelector,
    FormArrayField
} from '../form';
import { CaptureSubType } from '../../types/capture';
import { useSagas } from '../../hooks/useSagas';
import { useCaptures } from '../../hooks/useCaptures';
import { generateSimpleId } from '../../utils/uuidUtil';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CaptureFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSubType?: CaptureSubType;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function CaptureFormSheet({
    visible,
    onClose,
    initialSubType = CaptureSubType.NOTE,
    initialSagaId,
    onSuccess,
}: CaptureFormSheetProps) {
    const { theme } = useTheme();
    const { addCapture } = useCaptures();
    const { sagas } = useSagas();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captureType, setCaptureType] = useState<CaptureSubType>(initialSubType);

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
    }));

    // Setup CAPTURE_TYPE_OPTIONS
    const CAPTURE_TYPE_OPTIONS = [
        { label: 'Note', value: CaptureSubType.NOTE },
        { label: 'Spark', value: CaptureSubType.SPARK },
        { label: 'Action', value: CaptureSubType.ACTION },
        { label: 'Reflection', value: CaptureSubType.REFLECTION },
    ];

    // Setup saga options
    const sagaOptions = sagas.map(saga => ({
        label: saga.name,
        value: saga.id,
        icon: saga.icon
    }));

    // Add an empty option with an empty string icon instead of undefined
    sagaOptions.unshift({ label: 'None', value: '', icon: '' as IconName });

    const defaultValues = {
        subType: initialSubType,
        title: '',
        body: '',
        sagaId: initialSagaId || '',
        tags: [],
        mood: 3, // Default to neutral mood
        prompt: '',
        done: false,
        dueDate: undefined,
        subActions: [],
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setCaptureType(initialSubType);
            setIsSubmitting(false);
        }
    }, [visible, initialSubType]);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const success = await addCapture({
                ...data,
                subType: captureType,
                subActions: data.subActions?.map((action: any) => ({
                    ...action,
                    id: action.id || generateSimpleId(),
                })),
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the capture. Please try again.');
            }
        } catch (error) {
            console.error('Error creating capture:', error);
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
                            <Typography variant="h3">Create Capture</Typography>
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
                                    name="subType"
                                    control={control}
                                    label="Capture Type"
                                    options={CAPTURE_TYPE_OPTIONS}
                                    rules={{ required: 'Capture type is required' }}
                                    onChange={(value: CaptureSubType) => setCaptureType(value)}
                                />

                                <FormSelect
                                    name="sagaId"
                                    control={control}
                                    label="Saga"
                                    options={sagaOptions}
                                    placeholder="Select a saga (optional)"
                                />

                                <FormInput
                                    name="title"
                                    control={control}
                                    label="Title"
                                    placeholder="Enter a title..."
                                    rules={{ required: 'Title is required' }}
                                />

                                {captureType === CaptureSubType.NOTE && (
                                    <FormTextarea
                                        name="body"
                                        control={control}
                                        label="Note"
                                        placeholder="Write your note..."
                                        rules={{ required: 'Note content is required' }}
                                        numberOfLines={6}
                                    />
                                )}

                                {captureType === CaptureSubType.SPARK && (
                                    <FormTextarea
                                        name="body"
                                        control={control}
                                        label="Spark"
                                        placeholder="Capture your insight..."
                                        rules={{ required: 'Spark content is required' }}
                                        numberOfLines={3}
                                    />
                                )}

                                {captureType === CaptureSubType.REFLECTION && (
                                    <>
                                        <FormInput
                                            name="prompt"
                                            control={control}
                                            label="Reflection Prompt (optional)"
                                            placeholder="What prompted this reflection?"
                                        />

                                        <FormMoodSelector
                                            name="mood"
                                            control={control}
                                            label="How are you feeling?"
                                            rules={{ required: 'Please select a mood' }}
                                        />

                                        <FormTextarea
                                            name="body"
                                            control={control}
                                            label="Reflection"
                                            placeholder="Write your reflection..."
                                            rules={{ required: 'Reflection content is required' }}
                                            numberOfLines={6}
                                        />
                                    </>
                                )}

                                {captureType === CaptureSubType.ACTION && (
                                    <>
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
                                    </>
                                )}

                                <View style={styles.buttonContainer}>
                                    <Button
                                        label={isSubmitting ? "Saving..." : "Save Capture"}
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