// src/components/sagas/SagaCreationSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { IconName } from '../common/Icon';
import IconPicker from '../common/IconPicker';
import FormInput from '../common/FormInput';
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
    const [slideAnimation] = useState(new Animated.Value(SCREEN_HEIGHT));

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

    // Animation for sliding up/down
    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideAnimation, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [visible, slideAnimation]);

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

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.keyboardView}
                        >
                            <Animated.View
                                style={[
                                    styles.container,
                                    {
                                        backgroundColor: theme.colors.background,
                                        transform: [{ translateY: slideAnimation }]
                                    }
                                ]}
                            >
                                <View style={styles.header}>
                                    <Typography variant="h3">Create New Saga</Typography>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={onClose}
                                    >
                                        <Typography color="secondary">Cancel</Typography>
                                    </TouchableOpacity>
                                </View>

                                {/* Saga Name Input */}
                                <FormInput<FormValues>
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
                                                    <Typography variant="caption" style={{
                                                        color: theme.colors.error,
                                                        marginTop: 4
                                                    }}>
                                                        {errors.icon.message}
                                                    </Typography>
                                                )}
                                            </View>
                                        )}
                                    />
                                </View>

                                {/* Create Button */}
                                <View style={styles.buttonContainer}>
                                    <Button
                                        label="Create Saga"
                                        variant="primary"
                                        leftIcon="plus"
                                        onPress={handleSubmit(onSubmit)}
                                        disabled={!isValid}
                                    />
                                </View>
                            </Animated.View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: SCREEN_HEIGHT * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        padding: 8,
    },
    iconSection: {
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
});

export default SagaCreationSheet;