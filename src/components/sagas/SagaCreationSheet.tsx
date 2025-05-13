// src/components/sagas/SagaCreationSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { BottomSheet } from '../common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { IconName } from '../common/Icon';
import IconPicker from '../common/IconPicker';
import { FormInput } from '../form'; // Updated import path
import { Form } from '../form'; // Added Form component import
import { useForm, Controller } from 'react-hook-form';

interface SagaCreationSheetProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (saga: { name: string; icon: IconName }) => void;
}

// Form values type
type FormValues = {
    name: string;
    icon: IconName;
};

// Maximum character limit for saga names
const MAX_NAME_LENGTH = 25;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SagaCreationSheet: React.FC<SagaCreationSheetProps> = ({
    visible,
    onClose,
    onCreate
}) => {
    const { theme } = useTheme();

    // Initialize react-hook-form
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        watch
    } = useForm<FormValues>({
        defaultValues: {
            name: '',
            icon: undefined as unknown as IconName,
        },
        mode: 'onChange' // Validate on change for real-time feedback
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset({
                name: '',
                icon: undefined as unknown as IconName,
            });
        }
    }, [visible, reset]);

    // Handle form submission
    const onSubmit = (data: FormValues) => {
        onCreate({
            name: data.name.trim(),
            icon: data.icon,
        });
    };

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const styles = useStyles((theme) => ({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.shape.radius.l,
            borderTopRightRadius: theme.shape.radius.l,
            paddingTop: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.xl * 2, // enough to clear the nav
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
        iconSection: {
            marginBottom: theme.spacing.m,
        },
        errorText: {
            color: theme.colors.error,
            marginTop: 4,
        },
        buttonContainer: {
            marginTop: theme.spacing.m,
        },
        formContainer: {
            width: '100%',
        }
    }));

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
                            <Typography variant="h3">Create New Saga</Typography>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                            >
                                <Typography color="secondary">Cancel</Typography>
                            </TouchableOpacity>
                        </View>

                        <Form style={styles.formContainer}>
                            {/* Saga Name Input */}
                            <FormInput
                                control={control}
                                name="name"
                                label="Saga Name"
                                placeholder="Enter saga name..."
                                rules={{
                                    required: 'Saga name is required',
                                    maxLength: {
                                        value: MAX_NAME_LENGTH,
                                        message: `Name cannot exceed ${MAX_NAME_LENGTH} characters`
                                    }
                                }}
                                showCharCount
                                maxLength={MAX_NAME_LENGTH}
                                autoFocus
                            />

                            {/* Icon Picker */}
                            <View style={styles.iconSection}>
                                <Typography variant="h4" style={{ marginBottom: 8 }}>
                                    Choose an Icon
                                </Typography>
                                <Controller
                                    control={control}
                                    name="icon"
                                    rules={{ required: 'Please select an icon' }}
                                    render={({ field: { value, onChange } }) => (
                                        <View>
                                            <IconPicker
                                                selectedIcon={value}
                                                onSelectIcon={onChange}
                                            />
                                            {errors.icon && (
                                                <Typography variant="caption" style={styles.errorText}>
                                                    {errors.icon.message}
                                                </Typography>
                                            )}
                                        </View>
                                    )}
                                />
                            </View>

                            {/* Create Button */}
                            <View style={{ paddingBottom: 100 }}>
                                <Button
                                    label="Create Saga"
                                    variant="primary"
                                    leftIcon="plus"
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={!isValid}
                                />
                            </View>
                        </Form>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
};

export default SagaCreationSheet;