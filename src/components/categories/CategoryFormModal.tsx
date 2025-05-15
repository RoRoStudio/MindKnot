import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { FormModal } from '../common/FormModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useStyles } from '../../hooks/useStyles';
import {
    Form,
    FormInput,
} from '../form';
import { Category } from '../../types/category';
import { ColorPicker } from '../common/ColorPicker';

interface CategoryFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, color: string) => Promise<any>;
    category?: Category; // For editing existing categories
}

export default function CategoryFormModal({
    visible,
    onClose,
    onSave,
    category,
}: CategoryFormModalProps) {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string>(category?.color || '#4A90E2');

    const styles = useStyles((theme) => ({
        formContainer: {
            padding: theme.spacing.s,
        },
        colorSection: {
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        colorSectionLabel: {
            marginBottom: theme.spacing.s,
        },
    }));

    const defaultValues = {
        title: category?.title || '',
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens or category changes
    useEffect(() => {
        if (visible) {
            reset({
                title: category?.title || '',
            });
            setSelectedColor(category?.color || '#4A90E2');
            setIsSubmitting(false);
        }
    }, [visible, category]);

    const handleFormSubmit = async (data: any) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            await onSave(data.title, selectedColor);
            onClose();
        } catch (error) {
            console.error('Error saving category:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormModal
            visible={visible}
            onClose={onClose}
            title={category ? 'Edit Category' : 'Create Category'}
            onSubmit={handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
            isEdit={!!category}
            submitLabel={category ? 'Update' : 'Create'}
        >
            <Form>
                <FormInput
                    name="title"
                    control={control}
                    label="Category Name"
                    placeholder="Enter a name..."
                    rules={{ required: 'Category name is required' }}
                />

                <View style={styles.colorSection}>
                    <FormInput.Label label="Category Color" />
                    <ColorPicker
                        selectedColor={selectedColor}
                        onSelectColor={setSelectedColor}
                    />
                </View>
            </Form>
        </FormModal>
    );
} 