// src/components/form/FormCategorySelector.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Control, Controller, FieldValues, Path, useForm } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Icon, ColorPicker, Button } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import FormErrorMessage from './FormErrorMessage';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';

interface FormCategorySelectorProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
}

export default function FormCategorySelector<T extends FieldValues>({
    name,
    control,
    label = 'Category',
    helperText = 'Assign a category to organize your entries',
    placeholder = 'Select a category',
}: FormCategorySelectorProps<T>) {
    const { categories, loadCategories, addCategory } = useCategories();
    const [loading, setLoading] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#4A90E2');

    // Form for creating new category
    const { control: categoryFormControl, handleSubmit, reset, formState: { errors: categoryErrors } } = useForm({
        defaultValues: {
            title: '',
        },
        mode: 'onChange'
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                await loadCategories();
            } catch (error) {
                console.error('Error loading categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const { theme } = useTheme();

    const handleCreateCategory = handleSubmit(async (data) => {
        try {
            setCreatingCategory(true);
            await addCategory(data.title, selectedColor);
            // Reset form and collapse it
            reset({ title: '' });
            setSelectedColor('#4A90E2');
            setShowCategoryForm(false);
            // Refresh categories
            await loadCategories();
        } catch (error) {
            console.error('Error creating category:', error);
        } finally {
            setCreatingCategory(false);
        }
    });

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.xs,
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        categoryChip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            borderWidth: 2,
        },
        categoryChipSelected: {
            borderWidth: 2,
        },
        categoryChipLabel: {
            marginLeft: theme.spacing.xs,
        },
        colorIndicator: {
            width: 16,
            height: 16,
            borderRadius: 8,
        },
        addCategoryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            marginBottom: theme.spacing.s,
            borderRadius: theme.shape.radius.m,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.primary,
        },
        addCategoryLabel: {
            marginLeft: theme.spacing.xs,
            color: theme.colors.primary,
        },
        loadingText: {
            marginTop: theme.spacing.xs,
            color: theme.colors.textSecondary,
        },
        helperText: {
            marginTop: 4,
            color: theme.colors.textSecondary,
        },
        categoryFormContainer: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.m,
        },
        formRow: {
            marginBottom: theme.spacing.s,
        },
        colorSection: {
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        colorSectionLabel: {
            marginBottom: theme.spacing.s,
        },
        input: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            fontSize: 16,
            color: theme.colors.textPrimary,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: theme.spacing.m,
        },
    }));

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View style={styles.container}>
                    {label && (
                        <Typography variant="body1" style={styles.label}>
                            {label}
                        </Typography>
                    )}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 4 }}
                    >
                        <View style={styles.categoriesContainer}>
                            {/* "None" option */}
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    {
                                        borderColor: value === null || value === undefined
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                        backgroundColor: value === null || value === undefined
                                            ? theme.colors.primaryLight
                                            : theme.colors.surface,
                                    },
                                ]}
                                onPress={() => onChange(null)}
                            >
                                <View
                                    style={[
                                        styles.colorIndicator,
                                        { backgroundColor: theme.colors.surfaceVariant },
                                    ]}
                                />
                                <Typography style={styles.categoryChipLabel}>
                                    None
                                </Typography>
                            </TouchableOpacity>

                            {/* Category chips */}
                            {categories.map((category: Category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            borderColor: value === category.id
                                                ? category.color
                                                : theme.colors.border,
                                            backgroundColor: value === category.id
                                                ? `${category.color}20`  // 20% opacity
                                                : theme.colors.surface,
                                        },
                                    ]}
                                    onPress={() => onChange(category.id)}
                                >
                                    <View
                                        style={[
                                            styles.colorIndicator,
                                            { backgroundColor: category.color },
                                        ]}
                                    />
                                    <Typography style={styles.categoryChipLabel}>
                                        {category.title}
                                    </Typography>
                                </TouchableOpacity>
                            ))}

                            {/* Add category button */}
                            <TouchableOpacity
                                style={styles.addCategoryButton}
                                onPress={() => setShowCategoryForm(!showCategoryForm)}
                            >
                                <Icon
                                    name={showCategoryForm ? "minus" : "plus"}
                                    width={16}
                                    height={16}
                                    color={theme.colors.primary}
                                />
                                <Typography style={styles.addCategoryLabel}>
                                    {showCategoryForm ? "Cancel" : "Add New"}
                                </Typography>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {/* Expandable category form */}
                    {showCategoryForm && (
                        <View style={styles.categoryFormContainer}>
                            <Typography variant="h4">Create New Category</Typography>

                            <View style={styles.formRow}>
                                <Typography variant="body2" style={styles.colorSectionLabel}>
                                    Category Name
                                </Typography>
                                <Controller
                                    control={categoryFormControl}
                                    name="title"
                                    rules={{ required: 'Category name is required' }}
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter category name"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                {categoryErrors.title && (
                                    <FormErrorMessage
                                        message={categoryErrors.title.message}
                                        visible={!!categoryErrors.title}
                                    />
                                )}
                            </View>

                            <View style={styles.colorSection}>
                                <Typography variant="body2" style={styles.colorSectionLabel}>
                                    Category Color
                                </Typography>
                                <ColorPicker
                                    selectedColor={selectedColor}
                                    onSelectColor={setSelectedColor}
                                />
                            </View>

                            <View style={styles.buttonContainer}>
                                <Button
                                    label="Cancel"
                                    variant="secondary"
                                    onPress={() => {
                                        setShowCategoryForm(false);
                                        reset({ title: '' });
                                    }}
                                />
                                <Button
                                    label={creatingCategory ? "Creating..." : "Create"}
                                    variant="primary"
                                    onPress={handleCreateCategory}
                                    disabled={creatingCategory}
                                    isLoading={creatingCategory}
                                />
                            </View>
                        </View>
                    )}

                    {loading && (
                        <Typography variant="caption" style={styles.loadingText}>
                            Loading categories...
                        </Typography>
                    )}

                    <FormErrorMessage message={error?.message} visible={!!error} />

                    {helperText && !error && (
                        <Typography
                            variant="caption"
                            style={styles.helperText}
                        >
                            {helperText}
                        </Typography>
                    )}
                </View>
            )}
        />
    );
}