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
import CategoryPill from '../molecules/CategoryPill';

interface FormCategorySelectorProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
    /**
     * Optional direct handler for category selection
     * Used when not relying solely on react-hook-form
     */
    onSelectCategory?: (categoryId: string | null) => void;
}

export default function FormCategorySelector<T extends FieldValues>({
    name,
    control,
    label = 'Category',
    helperText = '',
    placeholder = 'Select a category',
    onSelectCategory,
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
            width: '100%',
        },
        label: {
            marginBottom: theme.spacing.s,
            fontSize: theme.typography.fontSize.m,
            fontWeight: '500',
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
            marginBottom: theme.spacing.s,
            width: '100%',
            paddingBottom: theme.spacing.m,
        },
        categoriesScrollView: {
            marginBottom: theme.spacing.s,
            maxHeight: 200, // Limit the height to ensure form is visible
        },
        addCategoryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            marginBottom: theme.spacing.m,
            marginRight: theme.spacing.s,
            borderRadius: theme.shape.radius.pill,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            alignSelf: 'flex-start',
        },
        addCategoryLabel: {
            marginLeft: theme.spacing.xs,
            color: theme.colors.textSecondary,
            flexShrink: 1,
            fontSize: theme.typography.fontSize.s,
        },
        loadingText: {
            marginTop: theme.spacing.xs,
            color: theme.colors.textSecondary,
        },
        helperText: {
            marginTop: theme.spacing.xs,
            color: theme.colors.textSecondary,
        },
        categoryFormContainer: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginVertical: theme.spacing.m,
            width: '100%',
        },
        formRow: {
            marginBottom: theme.spacing.s,
            width: '100%',
        },
        formRowTitle: {
            marginBottom: theme.spacing.xs,
            fontSize: theme.typography.fontSize.s,
            fontWeight: '500',
        },
        colorSection: {
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.m,
            width: '100%',
        },
        colorSectionLabel: {
            marginBottom: theme.spacing.s,
            fontSize: theme.typography.fontSize.s,
            fontWeight: '500',
        },
        input: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: theme.spacing.s,
            fontSize: 14,
            color: theme.colors.textPrimary,
            // Add subtle shadow for depth without borders
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 1,
            width: '100%',
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: theme.spacing.m,
            columnGap: theme.spacing.s,
            width: '100%',
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
            width: '100%',
        },
        closeButton: {
            padding: theme.spacing.xs,
        },
        categoryListContainer: {
            marginTop: theme.spacing.m,
            marginBottom: theme.spacing.l,
            width: '100%',
        },
        categoryListTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: '500',
            marginBottom: theme.spacing.s,
        },
        // Space to ensure enough room for scrolling
        spacer: {
            height: 100,
        }
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

                    {/* Add category button */}
                    <TouchableOpacity
                        style={styles.addCategoryButton}
                        onPress={() => setShowCategoryForm(!showCategoryForm)}
                    >
                        <Icon
                            name={showCategoryForm ? "minus" : "plus"}
                            width={16}
                            height={16}
                            color={theme.colors.textSecondary}
                        />
                        <Typography style={styles.addCategoryLabel} numberOfLines={1}>
                            {showCategoryForm ? "Cancel" : "New Category"}
                        </Typography>
                    </TouchableOpacity>

                    {/* Expandable category form */}
                    {showCategoryForm && (
                        <View style={styles.categoryFormContainer}>
                            <View style={styles.headerRow}>
                                <Typography variant="h4">Create New Category</Typography>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => {
                                        setShowCategoryForm(false);
                                        reset({ title: '' });
                                    }}
                                >
                                    <Icon
                                        name="x"
                                        width={20}
                                        height={20}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formRow}>
                                <Typography style={styles.formRowTitle}>
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
                                <Typography style={styles.colorSectionLabel}>
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

                    {/* Existing Categories Section */}
                    <View style={styles.categoryListContainer}>
                        <Typography variant="body1" style={styles.categoryListTitle}>
                            Select a Category
                        </Typography>

                        <ScrollView
                            horizontal={false}
                            style={styles.categoriesScrollView}
                            showsVerticalScrollIndicator={true}
                        >
                            <View style={styles.categoriesContainer}>
                                {categories.map((category: Category) => (
                                    <CategoryPill
                                        key={category.id}
                                        title={category.title}
                                        color={category.color}
                                        selected={value === category.id}
                                        selectable={true}
                                        onPress={() => {
                                            // Toggle category selection
                                            const newValue = value === category.id ? null : category.id;
                                            onChange(newValue);
                                            if (onSelectCategory) {
                                                onSelectCategory(newValue);
                                            }
                                        }}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </View>

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

                    {/* Add spacer at the bottom to ensure scrollability */}
                    <View style={styles.spacer} />
                </View>
            )}
        />
    );
}