// src/components/notes/NoteFormSheet.tsx
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
    FormTagInput,
    FormCategorySelector

} from '../form';
import { createNote } from '../../services/noteService';
import { generateSimpleId } from '../../utils/uuidUtil';
import { useBottomSheet } from '../../contexts/BottomSheetContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NoteFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function NoteFormSheet({
    visible,
    onClose,
    onSuccess,
}: NoteFormSheetProps) {
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
    }));

    const defaultValues = {
        title: '',
        body: '',
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

            const success = await createNote({
                title: data.title,
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId
            });

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the note. Please try again.');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
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
                // Re-open the note form after creating a category
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
                            <Typography variant="h3">Create Note</Typography>
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
                                    label="Note"
                                    placeholder="Write your note..."
                                    rules={{ required: 'Note content is required' }}
                                    numberOfLines={6}
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
                                        label={isSubmitting ? "Saving..." : "Save Note"}
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