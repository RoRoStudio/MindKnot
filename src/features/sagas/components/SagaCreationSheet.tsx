// src/components/sagas/SagaCreationSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Keyboard,
    TouchableWithoutFeedback,
    Platform,
    KeyboardAvoidingView,
    TouchableOpacity,
    Dimensions,
    Alert
} from 'react-native';
import { BottomSheet, Typography, Button, IconName, IconPicker } from '../../../shared/components';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import FormInput from '../../../shared/components/FormInput';
import Form from '../../../shared/components/Form';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setIsSubmitting(false);
        }
    }, [visible, reset]);

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        if (isSubmitting) return; // Prevent double submission

        try {
            console.log("Submitting saga creation:", data);
            setIsSubmitting(true);

            // Make sure we have the required icon
            if (!data.icon) {
                Alert.alert("Missing Icon", "Please select an icon for your saga.");
                setIsSubmitting(false);
                return;
            }

            await onCreate({
                name: data.name.trim(),
                icon: data.icon,
            });

            // Close the sheet after successful creation
            onClose();
        } catch (error) {
            // Show error to the user
            console.error("Failed to create saga:", error);
            Alert.alert(
                "Error Creating Saga",
                "There was an error creating your saga. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dismiss keyboard when tapping outside input
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const styles = useThemedStyles((theme) => ({
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
                                disabled={isSubmitting}
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
                                    label={isSubmitting ? "Creating..." : "Create Saga"}
                                    variant="primary"
                                    leftIcon="plus"
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={!isValid || isSubmitting}
                                    isLoading={isSubmitting}
                                />
                            </View>
                        </Form>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </BottomSheet>
    );
};

export { SagaCreationSheet };