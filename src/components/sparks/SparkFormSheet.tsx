// src/components/sparks/SparkFormSheet.tsx
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
import { BottomSheet } from '../common/BottomSheet';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import {
    Form,
    FormInput,
    FormTextarea,
    FormTagInput

} from '../form';
import { createSpark } from '../../services/sparkService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SparkFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function SparkFormSheet({
    visible,
    onClose,
    onSuccess,
}: SparkFormSheetProps) {
    const { theme } = useTheme();
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
    }));

    const defaultValues = {
        title: '',
        body: '',
        tags: [],
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

            const success = await createSpark({
                title: data.title,
                body: data.body,
                tags: data.tags,
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the spark. Please try again.');
            }
        } catch (error) {
            console.error('Error creating spark:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
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
                            <Typography variant="h3">Create Spark</Typography>
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
                                    label="Spark"
                                    placeholder="Capture your insight..."
                                    rules={{ required: 'Spark content is required' }}
                                    numberOfLines={3}
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
                                        label={isSubmitting ? "Saving..." : "Save Spark"}
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