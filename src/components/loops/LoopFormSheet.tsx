// src/components/loops/LoopFormSheet.tsx
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
    FormSelect,
    FormArrayField,
} from '../form';
import { useSagas } from '../../hooks/useSagas';
import { useLoops } from '../../hooks/useLoops';
import { generateSimpleId } from '../../utils/uuidUtil';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoopFormSheetProps {
    visible: boolean;
    onClose: () => void;
    initialSagaId?: string;
    onSuccess?: () => void;
}

export default function LoopFormSheet({
    visible,
    onClose,
    initialSagaId,
    onSuccess
}: LoopFormSheetProps) {
    const { theme } = useTheme();
    const { sagas } = useSagas();
    const { addLoop } = useLoops();
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
        content: {
            flex: 1,
            width: '100%',
        },
        loopItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        buttonContainer: {
            marginTop: theme.spacing.l,
            paddingBottom: 100,
        },
    }));

    // Frequency options
    const FREQUENCY_OPTIONS = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekdays', value: 'weekdays' },
        { label: 'Weekends', value: 'weekends' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Custom', value: 'custom' },
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
        title: '',
        description: '',
        frequency: 'daily',
        sagaId: initialSagaId || '',
        items: [],
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

            const success = await addLoop({
                ...data,
                frequency: typeof data.frequency === 'string' ? data.frequency : JSON.stringify(data.frequency),
                items: data.items?.map((item: any) => ({
                    ...item,
                    id: item.id || generateSimpleId(),
                })),
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error creating loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderLoopItem = (item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={styles.loopItem}>
                <View style={styles.itemHeader}>
                    <Typography variant="h4">Item {index + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => remove(index)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`items.${index}.name` as any}
                    control={control}
                    label="Name"
                    placeholder="Item name"
                    rules={{ required: 'Name is required' }}
                />

                <FormTextarea
                    name={`items.${index}.description` as any}
                    control={control}
                    label="Description (optional)"
                    placeholder="Describe this item..."
                    numberOfLines={3}
                />

                <FormInput
                    name={`items.${index}.durationMinutes` as any}
                    control={control}
                    label="Duration (minutes, optional)"
                    placeholder="e.g. 30"
                    keyboardType="numeric"
                />

                <FormInput
                    name={`items.${index}.quantity` as any}
                    control={control}
                    label="Quantity (optional)"
                    placeholder="e.g. 3 sets"
                />

                <FormSelect
                    name={`items.${index}.sagaId` as any}
                    control={control}
                    label="Link to Saga (optional)"
                    options={sagaOptions}
                    placeholder="Select a saga"
                />
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
                            <Typography variant="h3">Create Loop</Typography>
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
                                    label="Loop Title"
                                    placeholder="E.g. Morning Routine"
                                    rules={{ required: 'Title is required' }}
                                />

                                <FormTextarea
                                    name="description"
                                    control={control}
                                    label="Description (optional)"
                                    placeholder="Describe this loop..."
                                    numberOfLines={3}
                                />

                                <FormSelect
                                    name="frequency"
                                    control={control}
                                    label="Frequency"
                                    options={FREQUENCY_OPTIONS}
                                    rules={{ required: 'Frequency is required' }}
                                />

                                <FormArrayField
                                    name="items"
                                    control={control}
                                    label="Loop Items"
                                    renderItem={renderLoopItem}
                                    addButtonLabel="Add Loop Item"
                                    defaultValue={{ name: '', description: '' }}
                                />

                                <View style={styles.buttonContainer}>
                                    <Button
                                        label={isSubmitting ? "Saving..." : "Save Loop"}
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