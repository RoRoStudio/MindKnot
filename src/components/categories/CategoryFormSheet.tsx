// src/components/categories/CategoryFormSheet.tsx
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
} from '../form';
import { Category } from '../../types/category';
import { ColorPicker } from '../common/ColorPicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoryFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, color: string) => Promise<any>;
    category?: Category; // For editing existing categories
}

export default function CategoryFormSheet({
    visible,
    onClose,
    onSave,
    category,
}: CategoryFormSheetProps) {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string>(category?.color || '#4A90E2');

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
                            <Typography variant="h3">
                                {category ? 'Edit Category' : 'Create Category'}
                            </Typography>
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
                                    label="Category Name"
                                    placeholder="Enter a name..."
                                    rules={{ required: 'Category name is required' }}
                                />

                                <View style={styles.colorSection}>
                                    <Typography style={styles.colorSectionLabel}>Category Color</Typography>
                                    <ColorPicker
                                        selectedColor={selectedColor}
                                        onSelectColor={setSelectedColor}
                                    />
                                </View>

                                <View style={styles.buttonContainer}>
                                    <Button
                                        label={isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
                                        variant="primary"
                                        onPress={handleSubmit(handleFormSubmit)}
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting || !isValid}
                                        fullWidth
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