// src/components/notes/NoteFormSheet.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    Dimensions,
} from 'react-native';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { FormSheet } from '../../common/FormSheet';
import {
    Form,
    FormInput,
    FormRichTextarea,
    FormTagInput,
    FormCategorySelector
} from '../../form';
import { createNote, updateNote } from '../../../services/noteService';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the shape of form values
interface NoteFormValues {
    title: string;
    body: string;
    tags: string[];
    categoryId: string | null;
}

interface NoteFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    noteToEdit?: Partial<NoteFormValues> & { id?: string };
}

export default function NoteFormSheet({
    visible,
    onClose,
    onSuccess,
    noteToEdit,
}: NoteFormSheetProps) {
    const { theme } = useTheme();
    const { showCategoryForm } = useBottomSheet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!noteToEdit;

    const styles = useStyles((theme) => ({
        formContainer: {
            width: '100%',
        },
    }));

    // Define specific bottom sheet properties to ensure visibility
    const bottomSheetProps = {
        maxHeight: 0.85, // 85% of screen height
        minHeight: 400,  // Minimum height to ensure content is visible
        snapPoints: [0.85, 0.5], // Snap to 85% or 50% of screen height
    };

    const defaultValues: NoteFormValues = {
        title: noteToEdit?.title || '',
        body: noteToEdit?.body || '',
        tags: noteToEdit?.tags || [],
        categoryId: noteToEdit?.categoryId || null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<NoteFormValues>({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible, noteToEdit]);

    const handleFormSubmit = async (data: NoteFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const noteData = {
                title: data.title,
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (isEditMode && noteToEdit?.id) {
                success = await updateNote(noteToEdit.id, noteData);
            } else {
                success = await createNote(noteData);
            }

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the note. Please try again.');
            }
        } catch (error) {
            console.error('Error handling note:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
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
        <FormSheet
            visible={visible}
            onClose={onClose}
            title={isEditMode ? "Edit Note" : "Create Note"}
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
                        label="Note"
                        placeholder="Write your note..."
                        rules={{ required: 'Note content is required' }}
                        numberOfLines={6}
                        editorMode="full"
                        resizable={true}
                        minHeight={150}
                        maxHeight={400}
                    />

                    <FormCategorySelector
                        name="categoryId"
                        control={control as unknown as Control<FieldValues>}
                        label="Category"
                        onCreateCategory={handleCreateCategory}
                    />

                    <FormTagInput
                        name="tags"
                        control={control as unknown as Control<FieldValues>}
                        label="Tags"
                    />
                </Form>
            </View>
        </FormSheet>
    );
}