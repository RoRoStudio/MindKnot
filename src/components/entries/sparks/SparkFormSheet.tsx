// src/components/sparks/SparkFormSheet.tsx
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
    FormTextarea,
    FormTagInput,
    FormCategorySelector
} from '../../form';
import { createSpark, updateSpark } from '../../../services/sparkService';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define the shape of form values
interface SparkFormValues {
    title: string;
    body: string;
    tags: string[];
    categoryId: string | null;
}

interface SparkFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    sparkToEdit?: Partial<SparkFormValues> & { id?: string };
}

export default function SparkFormSheet({
    visible,
    onClose,
    onSuccess,
    sparkToEdit
}: SparkFormSheetProps) {
    const { theme } = useTheme();
    const { showCategoryForm } = useBottomSheet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!sparkToEdit;

    const styles = useStyles((theme) => ({
        formContainer: {
            width: '100%',
        },
    }));

    const defaultValues: SparkFormValues = {
        title: sparkToEdit?.title || '',
        body: sparkToEdit?.body || '',
        tags: sparkToEdit?.tags || [],
        categoryId: sparkToEdit?.categoryId || null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<SparkFormValues>({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible, sparkToEdit]);

    const handleFormSubmit = async (data: SparkFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const sparkData = {
                title: data.title,
                body: data.body,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (isEditMode && sparkToEdit?.id) {
                success = await updateSpark(sparkToEdit.id, sparkData);
            } else {
                success = await createSpark(sparkData);
            }

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the spark. Please try again.');
            }
        } catch (error) {
            console.error('Error handling spark:', error);
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
                // Re-open the spark form after creating a category
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
            title={isEditMode ? "Edit Spark" : "Create Spark"}
            onSubmit={handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
            isEdit={isEditMode}
            submitLabel={isEditMode ? "Update" : "Create"}
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

                    <FormTextarea
                        name="body"
                        control={control as unknown as Control<FieldValues>}
                        label="Spark"
                        placeholder="Capture your insight..."
                        rules={{ required: 'Spark content is required' }}
                        numberOfLines={3}
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