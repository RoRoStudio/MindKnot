// src/components/form/FormCategorySelector.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    StyleSheet,
} from 'react-native';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useStyles } from '../../hooks/useStyles';
import { Typography } from '../common/Typography';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../common/Icon';
import FormErrorMessage from './FormErrorMessage';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';


interface FormCategorySelectorProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
    onCreateCategory?: () => void;
}

export default function FormCategorySelector<T extends FieldValues>({
    name,
    control,
    label = 'Category',
    helperText = 'Assign a category to organize your entries',
    placeholder = 'Select a category',
    onCreateCategory,
}: FormCategorySelectorProps<T>) {
    const { categories, loadCategories } = useCategories();
    const [loading, setLoading] = useState(false);

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
                            {onCreateCategory && (
                                <TouchableOpacity
                                    style={styles.addCategoryButton}
                                    onPress={onCreateCategory}
                                >
                                    <Icon name="plus" width={16} height={16} color={theme.colors.primary} />
                                    <Typography style={styles.addCategoryLabel}>
                                        Add New
                                    </Typography>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>

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
                            color="secondary"
                        >
                            {helperText}
                        </Typography>
                    )}
                </View>
            )}
        />
    );
}